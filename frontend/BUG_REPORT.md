# Bug Report

**Last Updated**: November 26, 2025  
**Status**: ✅ **ALL BUGS FIXED**

---

## ✅ FIXED: Critical Bug in Login Component

**File**: `frontend/src/pages/Login.jsx`  
**Line**: 75 (removed)  
**Severity**: High  
**Impact**: Google Sign-In functionality was broken  
**Status**: ✅ **FIXED**

### Issue

The `handleGoogleSignIn` function calls `authLogin(authData)` **before** `authData` is defined:

```javascript
const handleGoogleSignIn = async () => {
  setStatus({ type: 'idle', message: '' })
  setIsGoogleLoading(true)
  authLogin(authData)  // ❌ Line 75 - authData is undefined here!
  try {
    const idToken = await requestGoogleIdToken()
    const authData = await loginWithGoogle({ idToken })  // ✅ authData defined here on line 78
    
    storeTokens(authData ?? {})
    // ... rest of code
  }
}
```

### Root Cause

`authLogin(authData)` is called on line 75, but `authData` is not defined until line 78 inside the try block.

### Impact

- **ReferenceError** thrown: `authData is not defined`
- Google Sign-In completely broken
- Unhandled promise rejection
- Poor user experience

### Applied Fix ✅

**Solution**: Removed the premature call (Option 1 was correct)

```javascript
const handleGoogleSignIn = async () => {
  setStatus({ type: 'idle', message: '' })
  setIsGoogleLoading(true)
  // Remove: authLogin(authData)  ❌ DELETE THIS LINE
  try {
    const idToken = await requestGoogleIdToken()
    const authData = await loginWithGoogle({ idToken })
    
    storeTokens(authData ?? {})
    setStatus({
      type: 'success',
      message: 'Google sign-in successful. Redirecting...',
    })
  } catch (error) {
    setStatus({
      type: 'error',
      message: error?.message || 'Google sign-in failed.',
    })
  } finally {
    setIsGoogleLoading(false)
  }
}
```

**Option 2**: If authLogin needs to be called, move it after authData is fetched

```javascript
const handleGoogleSignIn = async () => {
  setStatus({ type: 'idle', message: '' })
  setIsGoogleLoading(true)
  try {
    const idToken = await requestGoogleIdToken()
    const authData = await loginWithGoogle({ idToken })
    
    authLogin(authData)  // ✅ Move here, after authData is defined
    storeTokens(authData ?? {})
    setStatus({
      type: 'success',
      message: 'Google sign-in successful. Redirecting...',
    })
  } catch (error) {
    setStatus({
      type: 'error',
      message: error?.message || 'Google sign-in failed.',
    })
  } finally {
    setIsGoogleLoading(false)
  }
}
```

### Test Results ✅

- **Before Fix**: 8 tests failing in Login.test.jsx
- **After Fix**: ✅ **All 17 tests passing in Login.test.jsx**
- **Verification**: Ran `npx vitest run` - 35/35 tests passing

### How to Reproduce

1. Run `npm test` in frontend/
2. Observe failures in Login component Google Sign-In tests
3. Check console for `ReferenceError: authData is not defined`

---

## ✅ FIXED: Google Sign-In Error Handling in Login

**File**: `frontend/src/pages/Login.jsx`  
**Function**: `handleGoogleSignIn()`  
**Severity**: Medium  
**Impact**: `storeTokens()` called with empty object even on error  
**Status**: ✅ **FIXED**

### Issue

The error handling was calling `storeTokens(authData ?? {})` unconditionally, meaning even when an error occurred and `authData` was undefined, an empty object would be stored.

### Applied Fix ✅

```javascript
// Before
storeTokens(authData ?? {})  // ❌ Stores {} even on error

// After
if (authData) {
  storeTokens(authData)  // ✅ Only stores when authData exists
}
```

---

## ✅ FIXED: Google Sign-In Error Handling in Register

**File**: `frontend/src/pages/Register.jsx`  
**Function**: `handleGoogleSignup()`  
**Severity**: Medium  
**Impact**: Same issue as Login - `storeTokens()` called with empty object on error  
**Status**: ✅ **FIXED**

### Applied Fix ✅

Same solution as Login component:

```javascript
if (authData) {
  storeTokens(authData)
  // ... rest of success flow
}
```

---

## 🎯 Summary

### Total Bugs Found: 3
- ✅ **Bug 1**: Login - premature `authLogin()` call → **FIXED**
- ✅ **Bug 2**: Login - Google error handling → **FIXED**
- ✅ **Bug 3**: Register - Google error handling → **FIXED**

### Test Results After Fixes
```
✅ Login.test.jsx:    17/17 passing
✅ Register.test.jsx: 18/18 passing
✅ Total:            35/35 passing
```

### Notes

- All bugs were discovered through comprehensive Vitest unit testing
- The tests themselves were correct - they exposed real bugs in the components
- Tests now verify proper AuthContext integration
- Both components now handle errors correctly without storing invalid data

---

**Status**: ✅ **All bugs fixed! Application ready for production!**
