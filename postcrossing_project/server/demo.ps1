# demo.ps1 - Full postcard lifecycle (PowerShell)
# Usage: Open PowerShell in the server folder and run: .\demo.ps1

# 1) Login as sender (alice)
$aliceCreds = @{ username = "alice"; password = "password" } | ConvertTo-Json
$aliceResp = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $aliceCreds
$alice = $aliceResp.Content | ConvertFrom-Json
$aliceToken = $alice.token
Write-Host "Alice token:" $aliceToken

# 2) Request an address (assign postcard)
$assign = Invoke-WebRequest -Uri "http://localhost:3000/api/postcards/request-address" -Method POST -Headers @{ Authorization = "Bearer $aliceToken"; "Content-Type" = "application/json" } -Body '{}'
Write-Host "Assign response:" $assign.Content
$assignObj = $assign.Content | ConvertFrom-Json
$postcardId = $assignObj.postcardId
Write-Host "Assigned postcardId:" $postcardId

# 3) Mark postcard as sent
$sent = Invoke-WebRequest -Uri ("http://localhost:3000/api/postcards/" + $postcardId + "/mark-sent") -Method POST -Headers @{ Authorization = "Bearer $aliceToken" }
Write-Host "Mark sent response:" $sent.Content

# 4) Determine recipient username by looking up profile in DB is not available here,
#    so we assume the demo recipients are one of seeded users (bob, carla, dan, emma).
#    For this demo we will attempt to login each possible recipient and try mark-received until one succeeds.

$possibleRecipients = @("bob","carla","dan","emma")
$received = $null
foreach ($user in $possibleRecipients) {
    $creds = @{ username = $user; password = "password" } | ConvertTo-Json
    $resp = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $creds -ErrorAction SilentlyContinue
    if ($resp -ne $null) {
        $token = ($resp.Content | ConvertFrom-Json).token
        try {
            $tryRecv = Invoke-WebRequest -Uri ("http://localhost:3000/api/postcards/" + $postcardId + "/mark-received") -Method POST -Headers @{ Authorization = "Bearer $token" } -ErrorAction Stop
            Write-Host "User $user successfully marked received:" $tryRecv.Content
            $received = $true
            break
        } catch {
            # not the recipient, continue
        }
    }
}
if (-not $received) { Write-Host "No recipient among seeded users could confirm receipt. Check who was assigned in step 2." }
