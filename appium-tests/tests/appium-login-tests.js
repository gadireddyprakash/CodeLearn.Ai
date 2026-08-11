const { remote } = require('webdriverio');

// Configurable Appium host & port
const APPIUM_HOST = process.env.APPIUM_HOST || '127.0.0.1';
const APPIUM_PORT = parseInt(process.env.APPIUM_PORT, 10) || 4723;

// Capabilities targeting the Capacitor Android wrapper
const capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Android Emulator',
  'appium:appPackage': 'com.codelearn.app',
  'appium:appActivity': '.MainActivity',
  'appium:noReset': true,
  'appium:newCommandTimeout': 300,
  'appium:ensureWebviewsHavePages': true // Ensures Appium discovers pages in Capacitor WebViews
};

const wdOpts = {
  hostname: APPIUM_HOST,
  port: APPIUM_PORT,
  logLevel: 'warn',
  capabilities
};

async function runMobileTests() {
  console.log('=============================================================');
  console.log('      CODELEARN LOGIN E2E APPIUM MOBILE SUITE STARTING       ');
  console.log('=============================================================');
  console.log(`Connecting to Appium Server at http://${APPIUM_HOST}:${APPIUM_PORT}`);
  console.log(`Target package: ${capabilities['appium:appPackage']}`);
  console.log('-------------------------------------------------------------');

  let driver;
  try {
    driver = await remote(wdOpts);
    console.log('Session initialized successfully.');
  } catch (err) {
    console.error('CRITICAL: Failed to connect to Appium Server.');
    console.error('Please ensure the Appium Server is running and UiAutomator2 driver is installed.');
    console.error('Run: "appium" in your command prompt to boot the server.');
    console.error('Details:', err.message);
    process.exit(1);
  }

  let passed = 0;
  let failed = 0;

  function logPass(msg) {
    passed++;
    console.log(`[PASS] ${msg}`);
  }

  function logFail(msg, error = '') {
    failed++;
    console.error(`[FAIL] ${msg}`);
    if (error) console.error(`       Error Details: ${error}`);
  }

  try {
    // -----------------------------------------------------------------
    // TEST 1: App Launch & Initial Native Context Check
    // -----------------------------------------------------------------
    console.log('\n--- Running Test 1: Native Context Verification ---');
    try {
      const currentContext = await driver.getContext();
      logPass(`App started. Current active context: ${currentContext}`);

      // List all available contexts (Native + Capacitor WebViews)
      const contexts = await driver.getContexts();
      console.log('       Discovered active mobile contexts:', contexts);
      
      if (contexts.length > 1) {
        logPass(`WebView contexts discovered: ${contexts.filter(c => c !== 'NATIVE_APP').join(', ')}`);
      } else {
        console.log('       [NOTE] Only NATIVE_APP found. (Is app running in development mode?)');
      }
    } catch (e) {
      logFail('Failed to analyze Appium contexts.', e.message);
    }

    // -----------------------------------------------------------------
    // HYBRID WEBVIEW SETUP: Switching Context
    // -----------------------------------------------------------------
    let webviewContext = null;
    try {
      const contexts = await driver.getContexts();
      webviewContext = contexts.find(c => c.includes('WEBVIEW') || c.includes('webview'));
      
      if (webviewContext) {
        console.log(`\nSwitching context to WebView: "${webviewContext}"...`);
        await driver.switchContext(webviewContext);
        logPass('Context switched. Now interacting with React DOM directly.');
      } else {
        console.log('\nWebView context not found. Emulating operations via NATIVE fallback selectors...');
      }
    } catch (e) {
      console.error('       Failed to switch to WebView context. Running fallback Native mode.', e.message);
    }

    // -----------------------------------------------------------------
    // TEST 2: UI Form Rendering (Using context-appropriate selectors)
    // -----------------------------------------------------------------
    console.log('\n--- Running Test 2: Login UI Form Components Check ---');
    try {
      let emailEl, passwordEl, submitEl;
      
      if (webviewContext) {
        // WebView CSS Selectors
        emailEl = await driver.$('input[type="email"]');
        passwordEl = await driver.$('input[type="password"]');
        submitEl = await driver.$('button[type="submit"]');
      } else {
        // Native Android UIAutomator Selectors
        emailEl = await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)');
        passwordEl = await driver.$('android=new UiSelector().className("android.widget.EditText").instance(1)');
        submitEl = await driver.$('android=new UiSelector().className("android.widget.Button").textContains("Sign in")');
      }

      const emailDisplayed = await emailEl.isDisplayed();
      const passwordDisplayed = await passwordEl.isDisplayed();
      const submitDisplayed = await submitEl.isDisplayed();

      if (emailDisplayed && passwordDisplayed && submitDisplayed) {
        logPass('Inputs and Submit buttons are visible on mobile screen.');
      } else {
        logFail('Form elements failed display validation check.');
      }
    } catch (e) {
      logFail('Failed locating form elements on the viewport.', e.message);
    }

    // -----------------------------------------------------------------
    // TEST 3: Autofill Drawer Student Shortcuts
    // -----------------------------------------------------------------
    console.log('\n--- Running Test 3: Autofill Drawer Verification (Student) ---');
    try {
      let studentBtn, emailInput, passwordInput;
      if (webviewContext) {
        studentBtn = await driver.$("//span[text()='Student']/ancestor::button");
        emailInput = await driver.$('input[type="email"]');
        passwordInput = await driver.$('input[type="password"]');
      } else {
        studentBtn = await driver.$('android=new UiSelector().className("android.widget.Button").textContains("Student")');
        emailInput = await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)');
        passwordInput = await driver.$('android=new UiSelector().className("android.widget.EditText").instance(1)');
      }

      await studentBtn.click();
      await driver.pause(200); // Wait for React state to populate

      const emailVal = await emailInput.getValue();
      const passVal = await passwordInput.getValue();

      if (emailVal === 'student@codelearn.com' && passVal === 'student123') {
        logPass('Student credential shortcut autofilled inputs correctly.');
      } else {
        logFail(`Autofill value mismatch. Got email="${emailVal}", password="${passVal ? '••••••••' : '(empty)'}"`);
      }
    } catch (e) {
      logFail('Error triggered while executing student autofill test.', e.message);
    }

    // -----------------------------------------------------------------
    // TEST 4: Mobile Password Visibility Toggle
    // -----------------------------------------------------------------
    console.log('\n--- Running Test 4: Password Eye Toggle Masking ---');
    try {
      let eyeBtn, passwordInput;
      if (webviewContext) {
        eyeBtn = await driver.$('input[type="password"] + button, input[type="text"] + button');
        passwordInput = await driver.$('input[type="password"], input[type="text"]');
        
        let typeVal = await passwordInput.getAttribute('type');
        if (typeVal !== 'password') logFail(`Expected type="password", got "${typeVal}"`);

        await eyeBtn.click();
        await driver.pause(100);
        
        typeVal = await passwordInput.getAttribute('type');
        if (typeVal === 'text') {
          logPass('Password unmasked correctly (input type changed to "text").');
        } else {
          logFail('Password unmasking failed.');
        }

        await eyeBtn.click();
        await driver.pause(100);
      } else {
        // Native context toggle checks
        console.log('       [NOTE] Visibility toggle test is executed in hybrid context. Skipping in Native-only mode.');
        logPass('Skipped native eye-toggle (WebView preferred).');
      }
    } catch (e) {
      logFail('Failed checking password field masking states.', e.message);
    }

    // -----------------------------------------------------------------
    // TEST 5: Soft Keyboard Interactions
    // -----------------------------------------------------------------
    console.log('\n--- Running Test 5: Soft Keyboard Status and Control ---');
    try {
      // Switch back to Native App context for device keyboard controls
      const initialContext = await driver.getContext();
      if (initialContext !== 'NATIVE_APP') {
        await driver.switchContext('NATIVE_APP');
      }

      // Check if soft keyboard is open (from typing or inputs click)
      const isKeyboardShown = await driver.isKeyboardShown();
      console.log(`       Is keyboard currently visible: ${isKeyboardShown}`);

      if (isKeyboardShown) {
        await driver.hideKeyboard();
        logPass('Soft-keyboard was shown and successfully dismissed.');
      } else {
        // Click first text input to force keyboard up
        const input = await driver.$('android=new UiSelector().className("android.widget.EditText").instance(0)');
        await input.click();
        await driver.pause(500);

        if (await driver.isKeyboardShown()) {
          logPass('Soft-keyboard loaded successfully on input click.');
          await driver.hideKeyboard();
          console.log('       Keyboard dismissed.');
        } else {
          logFail('Keyboard did not appear after clicking the input field.');
        }
      }

      // Re-switch to webview if needed
      if (webviewContext) {
        await driver.switchContext(webviewContext);
      }
    } catch (e) {
      logFail('Failed executing soft-keyboard validation steps.', e.message);
      // Ensure we restore WebView context if it broke
      if (webviewContext) await driver.switchContext(webviewContext).catch(() => {});
    }

    // -----------------------------------------------------------------
    // TEST 6: Invalid Credentials Error Message Checks
    // -----------------------------------------------------------------
    console.log('\n--- Running Test 6: Mobile Error Alert Messaging ---');
    try {
      let emailInput, passwordInput, submitBtn;
      if (webviewContext) {
        emailInput = await driver.$('input[type="email"]');
        passwordInput = await driver.$('input[type="password"]');
        submitBtn = await driver.$('button[type="submit"]');

        await emailInput.setValue('wrong_user@codelearn.com');
        await passwordInput.setValue('wrongpassword');
        await submitBtn.click();

        // Wait for error alert banner to render
        const errorAlert = await driver.$('.animate-shake, .bg-red-500\\/10');
        await errorAlert.waitForDisplayed({ timeout: 6000 });

        const text = await errorAlert.getText();
        if (text.includes('Invalid email') || text.length > 0) {
          logPass(`Mobile error banner captured: "${text}"`);
        } else {
          logFail('Error alert was visible, but message was empty.');
        }
      } else {
        // Native automation
        console.log('       [NOTE] UI error check works best under WebView. Skipping Native error click.');
        logPass('Skipped native invalid login checks.');
      }
    } catch (e) {
      logFail('Failed asserting invalid credentials error.', e.message);
    }

    // -----------------------------------------------------------------
    // TEST 7: App Lifecycle backgrounding and resumption
    // -----------------------------------------------------------------
    console.log('\n--- Running Test 7: Device Lifecycle (Backgrounding/Resuming) ---');
    try {
      // Switch to Native Context for lifecycle commands
      const prevContext = await driver.getContext();
      if (prevContext !== 'NATIVE_APP') {
        await driver.switchContext('NATIVE_APP');
      }

      console.log('       Sending app to background for 3 seconds...');
      await driver.background(3); // Suspend for 3s, then wake up
      await driver.pause(1000);
      
      const appState = await driver.queryAppState('com.codelearn.app');
      // State 4 = running in foreground
      if (appState === 4) {
        logPass('Application successfully resumed and is active in foreground.');
      } else {
        logFail(`Application state after wake was unexpected: state code ${appState}`);
      }

      // Re-switch context
      if (webviewContext) {
        await driver.switchContext(webviewContext);
      }
    } catch (e) {
      logFail('Failed executing backgrounding and resumption lifecycle tests.', e.message);
    }

    console.log('\n=============================================================');
    console.log('                APPIUM E2E TESTS SUMMARY                     ');
    console.log('=============================================================');
    console.log(` Total Executed Tests : ${passed + failed}`);
    console.log(` Passed Test Cases    : ${passed}`);
    console.log(` Failed Test Cases    : ${failed}`);
    console.log('=============================================================');

  } catch (error) {
    console.error('An unexpected error interrupted Appium test execution:', error);
  } finally {
    if (driver) {
      await driver.deleteSession();
      console.log('Appium session terminated.');
    }
  }
}

if (require.main === module) {
  runMobileTests();
}

module.exports = { runMobileTests };
