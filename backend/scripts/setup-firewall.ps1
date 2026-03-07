# Set the port number
$port = 5000
$ruleName = "SmartCrew Backend (Port $port)"

Write-Host "Checking for existing firewall rule: $ruleName..." -ForegroundColor Cyan

# Check if the rule already exists
$existingRule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue

if ($existingRule) {
    Write-Host "Rule already exists. Skipping..." -ForegroundColor Yellow
} else {
    Write-Host "Creating new inbound rule to allow traffic on port $port..." -ForegroundColor Green
    # Create the rule
    New-NetFirewallRule -DisplayName $ruleName `
                        -Direction Inbound `
                        -Action Allow `
                        -Protocol TCP `
                        -LocalPort $port `
                        -Description "Allow incoming connections for SmartCrew Backend simulation"
    Write-Host "Successfully added firewall rule!" -ForegroundColor Green
}

Write-Host "`nYour Backend should now be accessible by mobile devices on your local network." -ForegroundColor Green
Write-Host "Make sure both your PC and Phone are on the SAME WiFi network." -ForegroundColor White
