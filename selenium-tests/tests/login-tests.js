const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Configuration - easily customizable via Environment Variables
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const LOGIN_URL = `${BASE_URL}/login`;
const HEADLESS = process.env.HEADLESS !== 'false'; // Default to headless mode for CI/CD compatibility

async function runTests() {
  console.log('=============================================================');
  console.log('      CODELEARN LOGIN E2E SELENIUM TEST SUITE STARTING       ');
  console.log('=============================================================');
  console.log(`Target URL: ${LOGIN_URL}`);
  console.log(`Headless Mode: ${HEADLESS}`);
  console.log('-------------------------------------------------------------');

  // Set up Chrome Options
  let options = new chrome.Options();
  if (HEADLESS) {
    options.addArguments('--headless');
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
  }
  options.addArguments('--window-size=1280,1024');

  let driver;
  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  } catch (err) {
    console.error('CRITICAL: Failed to initialize Chrome WebDriver.');
    console.error('Please ensure Chrome browser is installed and compatible.');
    console.error('Details:', err.message);
    process.exit(1);
  }

  let passedTestsCount = 0;
  let failedTestsCount = 0;

  function logPass(msg) {
    passedTestsCount++;
    console.log(`[PASS] ${msg}`);
  }

  function logFail(msg, error = '') {
    failedTestsCount++;
    console.error(`[FAIL] ${msg}`);
    if (error) console.error(`       Error Details: ${error}`);
  }

  try {
    // -----------------------------------------------------------------
    // TEST CASE 1: Page Load & Layout Integrity Check
    // -----------------------------------------------------------------
    console.log('\n--- Running Test 1: Page Loading and Structure Verification ---');
    try {
      await driver.get(LOGIN_URL);
      
      // Wait for CodeLearn logo text to load
      const logoEl = await driver.wait(
        until.elementLocated(By.xpath("//span[text()='CodeLearn']")),
        10000
      );
      
      const pageTitle = await driver.getTitle();
      logPass(`Page loaded successfully. Title: "${pageTitle}"`);

      // Verify essential inputs and buttons exist
      const emailInput = await driver.findElement(By.css('input[type="email"]'));
      const passwordInput = await driver.findElement(By.css('input[type="password"]'));
      const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
      const studentTabBtn = await driver.findElement(By.xpath("//button[contains(., 'Student & Teacher')]"));
      const adminTabBtn = await driver.findElement(By.xpath("//button[contains(., 'Admin Portal')]"));

      if (emailInput && passwordInput && submitBtn && studentTabBtn && adminTabBtn) {
        logPass('Core login interface elements are rendered correctly.');
      } else {
        logFail('One or more core login interface elements are missing.');
      }
    } catch (e) {
      logFail('Login page failed to load or did not render core UI elements.', e.message);
    }

    // Re-locate inputs for subsequent steps
    const emailInput = await driver.findElement(By.css('input[type="email"]'));
    const passwordInput = await driver.findElement(By.css('input[type="password"]'));
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));

    // -----------------------------------------------------------------
    // TEST CASE 2: Student Quick Credentials Autofill
    // -----------------------------------------------------------------
    console.log('\n--- Running Test 2: Quick Credentials Autofill (Student) ---');
    try {
      const studentAutofillBtn = await driver.findElement(By.xpath("//span[text()='Student']/ancestor::button"));
      await studentAutofillBtn.click();
      
      // Allow react rendering state update
      await driver.sleep(100);

      const emailVal = await emailInput.getAttribute('value');
      const passwordVal = await passwordInput.getAttribute('value');
      
      if (emailVal === 'student@codelearn.com' && passwordVal === 'student123') {
        logPass('Student credentials successfully autofilled from drawer.');
      } else {
        logFail(`Autofill values mismatch. Got email="${emailVal}", password="${passwordVal ? '••••••••' : '(empty)'}"`);
      }
    } catch (e) {
      logFail('Failed to locate or click Student autofill drawer button.', e.message);
    }

    // -----------------------------------------------------------------
    // TEST CASE 3: Password Masking Toggle
    // -----------------------------------------------------------------
    console.log('\n--- Running Test 3: Password Visibility Toggle ---');
    try {
      // Find the toggle visibility button inside password input container
      const eyeToggleBtn = await driver.findElement(By.css('input[type="password"] + button, input[type="text"] + button'));
      
      // Ensure type is password initially
      let typeInitial = await passwordInput.getAttribute('type');
      if (typeInitial !== 'password') {
        logFail(`Expected type="password" initially, but got "${typeInitial}"`);
      }

      // Click to make password visible
      await eyeToggleBtn.click();
      await driver.sleep(100);
      let typeVisible = await passwordInput.getAttribute('type');
      if (typeVisible === 'text') {
        logPass('Password text successfully unmasked (type changed to "text").');
      } else {
        logFail(`Expected type="text" after toggle, but got "${typeVisible}"`);
      }

      // Click to mask password again
      await eyeToggleBtn.click();
      await driver.sleep(100);
      let typeMaskedAgain = await passwordInput.getAttribute('type');
      if (typeMaskedAgain === 'password') {
        logPass('Password text successfully re-masked (type changed back to "password").');
      } else {
        logFail(`Expected type="password" after toggle, but got "${typeMaskedAgain}"`);
      }
    } catch (e) {
      logFail('Failed to toggle password visibility.', e.message);
    }

    // -----------------------------------------------------------------
    // TEST CASE 4: Invalid Credentials Validation Error
    // -----------------------------------------------------------------
    console.log('\n--- Running Test 4: Invalid Credentials Validation ---');
    try {
      // Clear inputs
      await emailInput.click();
      await emailInput.sendKeys(Key.CONTROL + 'a');
      await emailInput.sendKeys(Key.BACK_SPACE);
      await emailInput.sendKeys('invalid_student@codelearn.com');

      await passwordInput.click();
      await passwordInput.sendKeys(Key.CONTROL + 'a');
      await passwordInput.sendKeys(Key.BACK_SPACE);
      await passwordInput.sendKeys('wrongpassword');

      await submitBtn.click();

      // Wait for error shake container to be located
      const errorAlert = await driver.wait(
        until.elementLocated(By.css('.animate-shake, .bg-red-500\\/10')),
        6000
      );

      const errorMsgText = await errorAlert.getText();
      if (errorMsgText && errorMsgText.length > 0) {
        logPass(`Error alert display verified. Error Message: "${errorMsgText}"`);
      } else {
        logFail('Error alert was visible, but message content was empty.');
      }
    } catch (e) {
      logFail('Failed to trigger or locate error alert for invalid credentials.', e.message);
    }

    // -----------------------------------------------------------------
    // TEST CASE 5: Teacher Quick Credentials Autofill
    // -----------------------------------------------------------------
    console.log('\n--- Running Test 5: Quick Credentials Autofill (Teacher) ---');
    try {
      const teacherAutofillBtn = await driver.findElement(By.xpath("//span[text()='Teacher']/ancestor::button"));
      await teacherAutofillBtn.click();
      await driver.sleep(100);

      const emailVal = await emailInput.getAttribute('value');
      const passwordVal = await passwordInput.getAttribute('value');

      if (emailVal === 'teacher@codelearn.com' && passwordVal === 'teacher123') {
        logPass('Teacher credentials successfully autofilled from drawer.');
      } else {
        logFail(`Autofill values mismatch. Got email="${emailVal}", password="${passwordVal ? '••••••••' : '(empty)'}"`);
      }
    } catch (e) {
      logFail('Failed to click Teacher autofill drawer button.', e.message);
    }

    // -----------------------------------------------------------------
    // TEST CASE 6: Switching Portal to Admin View
    // -----------------------------------------------------------------
    console.log('\n--- Running Test 6: Portal Tabs Switching (to Admin Portal) ---');
    try {
      const adminTabBtn = await driver.findElement(By.xpath("//button[contains(., 'Admin Portal')]"));
      await adminTabBtn.click();
      await driver.sleep(200);

      // Verify portal switch triggers styling change (red gradient bar is active)
      const activeBar = await driver.findElement(By.css('.from-red-500.to-rose-500'));
      const adminHeader = await driver.findElement(By.xpath("//h1[text()='Administrator Console']"));

      if (activeBar && adminHeader) {
        logPass('Successfully switched to Administrator Portal theme & layout.');
      } else {
        logFail('Failed to render Admin Console portal view.');
      }
    } catch (e) {
      logFail('Failed to trigger portal tab switch to Admin.', e.message);
    }

    // Re-locate inputs in admin theme context (though selectors remain same, DOM check is safe)
    const adminEmailInput = await driver.findElement(By.css('input[type="email"]'));
    const adminPasswordInput = await driver.findElement(By.css('input[type="password"]'));

    // -----------------------------------------------------------------
    // TEST CASE 7: Admin Quick Credentials Autofill
    // -----------------------------------------------------------------
    console.log('\n--- Running Test 7: Quick Credentials Autofill (Admin) ---');
    try {
      const adminAutofillBtn = await driver.findElement(By.xpath("//span[text()='Admin']/ancestor::button"));
      await adminAutofillBtn.click();
      await driver.sleep(100);

      const emailVal = await adminEmailInput.getAttribute('value');
      const passwordVal = await adminPasswordInput.getAttribute('value');

      if (emailVal === 'admin@codelearn.com' && passwordVal === 'admin123') {
        logPass('Admin credentials successfully autofilled from drawer.');
      } else {
        logFail(`Autofill values mismatch. Got email="${emailVal}", password="${passwordVal ? '••••••••' : '(empty)'}"`);
      }
    } catch (e) {
      logFail('Failed to click Admin autofill drawer button.', e.message);
    }

    // -----------------------------------------------------------------
    // TEST CASE 8: Setup & Seeding Admin DB Action
    // -----------------------------------------------------------------
    console.log('\n--- Running Test 8: Setup & Recover Admin Account Database Seed Trigger ---');
    try {
      const seedBtn = await driver.findElement(By.xpath("//button[contains(., 'Setup & Recover Admin Account')]"));
      await seedBtn.click();
      
      console.log('       Triggered seeding. Waiting for response database status change...');
      
      // Wait for success alert "credentials filled below"
      const seedAlert = await driver.wait(
        until.elementLocated(By.xpath("//span[contains(text(), 'credentials filled below') or contains(text(), 'seeded successfully')]")),
        12000
      );

      const alertMsg = await seedAlert.getText();
      const emailVal = await adminEmailInput.getAttribute('value');
      const passwordVal = await adminPasswordInput.getAttribute('value');

      if (alertMsg.includes('seeded successfully') || alertMsg.includes('credentials filled')) {
        if (emailVal === 'admin@codelearn.com' && passwordVal === 'admin123') {
          logPass('Database Admin successfully seeded and credentials populated into input fields.');
        } else {
          logFail(`DB Seed finished but credentials weren't filled in input. Got email="${emailVal}"`);
        }
      } else {
        logFail(`Unexpected message from Seeding banner: "${alertMsg}"`);
      }
    } catch (e) {
      logFail('Failed during administrative DB seeding verification.', e.message);
    }

    console.log('\n=============================================================');
    console.log('                   E2E TESTS SUMMARY                         ');
    console.log('=============================================================');
    console.log(` Total Executed Tests : ${passedTestsCount + failedTestsCount}`);
    console.log(` Passed Test Cases    : ${passedTestsCount}`);
    console.log(` Failed Test Cases    : ${failedTestsCount}`);
    console.log('=============================================================');

  } catch (error) {
    console.error('An unexpected error interrupted test execution:', error);
  } finally {
    if (driver) {
      await driver.quit();
      console.log('Browser session closed.');
    }
  }
}

// Run the script directly if triggered from shell
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
