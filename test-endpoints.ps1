# FatFoodie API Endpoint Test Script
# Run AFTER docker-compose up completes

$BASE = "http://localhost:3000"
$errors = 0

function Test-Endpoint {
  param(
    [string]$Method,
    [string]$Url,
    [hashtable]$Body,
    [hashtable]$Headers,
    [string]$Label,
    [int]$ExpectedStatus = 0
  )
  try {
    $params = @{
      Method          = $Method
      Uri             = $Url
      ContentType     = "application/json"
      UseBasicParsing = $true
    }
    if ($Body)    { $params.Body    = ($Body | ConvertTo-Json -Depth 10) }
    if ($Headers) { $params.Headers = $Headers }
    $response = Invoke-WebRequest @params -ErrorAction Stop
    $status = $response.StatusCode
    $ok = if ($ExpectedStatus -eq 0) { $status -ge 200 -and $status -lt 300 } else { $status -eq $ExpectedStatus }
    $icon = if ($ok) { "OK" } else { "FAIL" }
    Write-Host "[$icon] $Label ($status)"
    return $response.Content | ConvertFrom-Json
  } catch {
    $status = $_.Exception.Response.StatusCode.value__
    Write-Host "[FAIL] $Label - HTTP $status : $($_.Exception.Message)"
    $script:errors++
    return $null
  }
}

Write-Host ""
Write-Host "=== FatFoodie Platform Tests ===" -ForegroundColor Cyan
Write-Host ""

# ---- AUTH ----
Write-Host "--- Auth Service ---" -ForegroundColor Yellow

Test-Endpoint -Method POST -Url "$BASE/auth/register" -Label "Register customer" -Body @{
  name = "Test Customer"; email = "customer@test.com"; password = "Test1234!"; role = "customer"
} | Out-Null
Test-Endpoint -Method POST -Url "$BASE/auth/register" -Label "Register restaurant owner" -Body @{
  name = "Owner User"; email = "owner@test.com"; password = "Test1234!"; role = "restaurant_owner"
} | Out-Null
Test-Endpoint -Method POST -Url "$BASE/auth/register" -Label "Register admin" -Body @{
  name = "Admin User"; email = "admin@test.com"; password = "Test1234!"; role = "admin"
} | Out-Null

$errors = 0  # reset - registrations may 409 if users exist from prev run

$login = Test-Endpoint -Method POST -Url "$BASE/auth/login" -Label "Login customer" -Body @{
  email = "customer@test.com"; password = "Test1234!"
}
$TOKEN = if ($login -and $login.token) { $login.token } elseif ($login -and $login.access_token) { $login.access_token } else { "" }
$USER_ID = if ($login -and $login.user) { $login.user.id } else { "" }

$loginOwner = Test-Endpoint -Method POST -Url "$BASE/auth/login" -Label "Login owner" -Body @{
  email = "owner@test.com"; password = "Test1234!"
}
$OWNER_TOKEN = if ($loginOwner -and $loginOwner.token) { $loginOwner.token } elseif ($loginOwner -and $loginOwner.access_token) { $loginOwner.access_token } else { "" }

$AUTH_HEADERS  = @{ Authorization = "Bearer $TOKEN" }
$OWNER_HEADERS = @{ Authorization = "Bearer $OWNER_TOKEN" }

Test-Endpoint -Method GET -Url "$BASE/auth/profile" -Label "Get profile (JWT verify)" -Headers $AUTH_HEADERS | Out-Null

# ---- USER ----
Write-Host ""
Write-Host "--- User Service ---" -ForegroundColor Yellow
Test-Endpoint -Method GET -Url "$BASE/users/me" -Label "Get current user" -Headers $AUTH_HEADERS | Out-Null
if ($USER_ID) {
  Test-Endpoint -Method PUT -Url "$BASE/users/$USER_ID" -Label "Update user profile" -Headers $AUTH_HEADERS -Body @{ name = "Updated Customer" } | Out-Null
  Test-Endpoint -Method POST -Url "$BASE/users/$USER_ID/addresses" -Label "Add address" -Headers $AUTH_HEADERS -Body @{
    label = "Home"; street = "123 Main St"; city = "Dhaka"; state = "Dhaka"; zipCode = "1000"
  } | Out-Null
} else {
  Write-Host "[SKIP] User PUT/address (no USER_ID)"
}

# ---- RESTAURANT ----
Write-Host ""
Write-Host "--- Restaurant Service ---" -ForegroundColor Yellow
$rest = Test-Endpoint -Method POST -Url "$BASE/restaurants" -Label "Create restaurant" -Headers $OWNER_HEADERS -Body @{
  name = "Test Bistro"; description = "Test restaurant"; city = "Dhaka"
  address = "456 Food St"; phone = "+8801700000000"; cuisineTypes = @("Italian")
  openingHours = @{ monday = "09:00-22:00" }
}
$RESTAURANT_ID = if ($rest -and $rest._id) { $rest._id } elseif ($rest -and $rest.id) { $rest.id } else { "" }

Test-Endpoint -Method GET -Url "$BASE/restaurants" -Label "List restaurants" | Out-Null
$MENU_ITEM_ID = ""
if ($RESTAURANT_ID) {
  Test-Endpoint -Method GET -Url "$BASE/restaurants/$RESTAURANT_ID" -Label "Get restaurant by ID" | Out-Null
  $menuItem = Test-Endpoint -Method POST -Url "$BASE/restaurants/$RESTAURANT_ID/menu" -Label "Add menu item" -Headers $OWNER_HEADERS -Body @{
    name = "Margherita Pizza"; description = "Classic pizza"; price = 12.99; category = "Pizza"
  }
  $MENU_ITEM_ID = if ($menuItem -and $menuItem._id) { $menuItem._id } elseif ($menuItem -and $menuItem.id) { $menuItem.id } else { "" }
  Test-Endpoint -Method GET -Url "$BASE/restaurants/$RESTAURANT_ID/menu" -Label "Get restaurant menu" | Out-Null
} else {
  Write-Host "[SKIP] Restaurant sub-routes (no RESTAURANT_ID)"
}

# ---- CART ----
Write-Host ""
Write-Host "--- Cart Service ---" -ForegroundColor Yellow
if ($RESTAURANT_ID -and $MENU_ITEM_ID) {
  Test-Endpoint -Method DELETE -Url "$BASE/cart" -Label "Clear cart" -Headers $AUTH_HEADERS | Out-Null
  Test-Endpoint -Method POST -Url "$BASE/cart/add" -Label "Add item to cart" -Headers $AUTH_HEADERS -Body @{
    restaurantId = $RESTAURANT_ID; itemId = $MENU_ITEM_ID; name = "Margherita Pizza"; price = 12.99; quantity = 2
  } | Out-Null
  Test-Endpoint -Method GET  -Url "$BASE/cart" -Label "Get cart" -Headers $AUTH_HEADERS | Out-Null
  Test-Endpoint -Method POST -Url "$BASE/cart/remove" -Label "Remove cart item" -Headers $AUTH_HEADERS -Body @{ itemId = $MENU_ITEM_ID } | Out-Null
  Test-Endpoint -Method POST -Url "$BASE/cart/add" -Label "Re-add cart item" -Headers $AUTH_HEADERS -Body @{
    restaurantId = $RESTAURANT_ID; itemId = $MENU_ITEM_ID; name = "Margherita Pizza"; price = 12.99; quantity = 1
  } | Out-Null
} else {
  Write-Host "[SKIP] Cart routes (no restaurant/menu IDs)"
}

# ---- ORDER ----
Write-Host ""
Write-Host "--- Order Service ---" -ForegroundColor Yellow
$ORDER_ID = ""
if ($RESTAURANT_ID -and $MENU_ITEM_ID) {
  $order = Test-Endpoint -Method POST -Url "$BASE/orders" -Label "Create order" -Headers $AUTH_HEADERS -Body @{
    restaurantId    = $RESTAURANT_ID
    items           = @(@{ menuItemId = $MENU_ITEM_ID; name = "Margherita Pizza"; price = 12.99; quantity = 1 })
    deliveryAddress = @{ street = "123 Main St"; city = "Dhaka"; state = "Dhaka"; zipCode = "1000" }
  }
  $ORDER_ID = if ($order -and $order.id) { $order.id } elseif ($order -and $order._id) { $order._id } else { "" }
  Test-Endpoint -Method GET -Url "$BASE/orders/me" -Label "My orders" -Headers $AUTH_HEADERS | Out-Null
  if ($ORDER_ID) {
    Test-Endpoint -Method GET -Url "$BASE/orders/$ORDER_ID" -Label "Get order by ID" -Headers $AUTH_HEADERS | Out-Null
    Test-Endpoint -Method PATCH -Url "$BASE/orders/$ORDER_ID/status" -Label "Update order status" -Headers $OWNER_HEADERS -Body @{ status = "confirmed" } | Out-Null
  }
} else {
  Write-Host "[SKIP] Order routes (no restaurant/menu IDs)"
}

# ---- PAYMENT ----
Write-Host ""
Write-Host "--- Payment Service ---" -ForegroundColor Yellow
if ($ORDER_ID) {
  $payment = Test-Endpoint -Method POST -Url "$BASE/payment/create" -Label "Create payment intent" -Headers $AUTH_HEADERS -Body @{
    orderId = $ORDER_ID; amount = 1299; currency = "usd"
  }
  $paymentSecret = if ($payment -and $payment.clientSecret) { $payment.clientSecret } else { "N/A" }
  Write-Host "   clientSecret: $paymentSecret"
} else {
  Write-Host "[SKIP] Payment (no ORDER_ID)"
}

# ---- DELIVERY ----
Write-Host ""
Write-Host "--- Delivery Service ---" -ForegroundColor Yellow
$loginAdmin = Test-Endpoint -Method POST -Url "$BASE/auth/login" -Label "Login admin" -Body @{
  email = "admin@test.com"; password = "Test1234!"
}
$ADMIN_TOKEN = if ($loginAdmin -and $loginAdmin.token) { $loginAdmin.token } elseif ($loginAdmin -and $loginAdmin.access_token) { $loginAdmin.access_token } else { "" }
$ADMIN_HEADERS = @{ Authorization = "Bearer $ADMIN_TOKEN" }

if ($ORDER_ID) {
  Test-Endpoint -Method POST -Url "$BASE/delivery/assign" -Label "Assign driver" -Headers $ADMIN_HEADERS -Body @{
    orderId = $ORDER_ID; userId = $USER_ID; driverId = "driver-001"
  } | Out-Null
  Test-Endpoint -Method PUT -Url "$BASE/delivery/status" -Label "Update delivery status" -Headers $ADMIN_HEADERS -Body @{
    orderId = $ORDER_ID; status = "picked_up"
  } | Out-Null
  Test-Endpoint -Method PUT -Url "$BASE/delivery/location" -Label "Update driver location" -Headers $ADMIN_HEADERS -Body @{
    orderId = $ORDER_ID; lat = 23.8103; lng = 90.4125
  } | Out-Null
  Test-Endpoint -Method GET -Url "$BASE/delivery/order/$ORDER_ID" -Label "Get delivery by order" -Headers $AUTH_HEADERS | Out-Null
} else {
  Write-Host "[SKIP] Delivery routes (no ORDER_ID)"
}

# ---- SUMMARY ----
Write-Host ""
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
if ($errors -eq 0) {
  Write-Host "All tests PASSED!" -ForegroundColor Green
} else {
  Write-Host "$errors test(s) FAILED" -ForegroundColor Red
}

