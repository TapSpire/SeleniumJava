const circle = document.getElementById("circle");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const restartBtn = document.getElementById("restartBtn");
const gameContainer = document.querySelector(".game-container");
const bonusSound = document.getElementById("bonus-sound");
const wordHolder = document.getElementById("wordHolder");

const textContent = [
  '0', '1', '2', '1', '0',
  '1', '2', '4', '2', '1',
  '2', '4', '8', '4', '2',
  '1', '2', '4', '2', '1',
  '0', '1', '2', '1', '0',
];



const correctWords = [
  "WebDriver driver = new ChromeDriver();",
  "driver.get(\"https://www.example.com\");",
  "driver.findElement(By.id(\"username\")).sendKeys(\"user1\");",
  "driver.findElement(By.name(\"password\")).sendKeys(\"pass123\");",
  "driver.findElement(By.className(\"submit-btn\")).click();",
  "driver.quit();",
  "driver.close();",
  "String title = driver.getTitle();",
  "String currentURL = driver.getCurrentUrl();",
  "WebElement element = driver.findElement(By.tagName(\"h1\"));",
  "driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));",
  "WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));",
  "wait.until(ExpectedConditions.visibilityOfElementLocated(By.id(\"welcome\")));",
  "driver.switchTo().alert().accept();",
  "driver.switchTo().alert().dismiss();",
  "driver.switchTo().frame(\"frame1\");",
  "driver.switchTo().defaultContent();",
  "Actions actions = new Actions(driver);",
  "actions.moveToElement(driver.findElement(By.id(\"menu\"))).perform();",
  "actions.doubleClick(driver.findElement(By.id(\"button\"))).perform();",
  "JavascriptExecutor js = (JavascriptExecutor) driver;",
  "js.executeScript(\"window.scrollBy(0,500)\");",
  "driver.navigate().to(\"https://google.com\");",
  "driver.navigate().back();",
  "driver.navigate().forward();",
  "driver.manage().window().maximize();",
  "TakesScreenshot screenshot = ((TakesScreenshot)driver);",
  "File src = screenshot.getScreenshotAs(OutputType.FILE);",
  "Select dropdown = new Select(driver.findElement(By.id(\"country\")));",
  "dropdown.selectByVisibleText(\"Canada\");"
];

const incorrectWords = [
  "WebDriver driver = new Firefox();",  // Incorrect constructor
  "driver.goto(\"http://site.com\");",  // No 'goto' method
  "driver.find(By.id(\"test\"));",  // Method 'find' doesn't exist
  "driver.getElements(By.className(\"box\"));",  // Should be 'findElements'
  "driver.click(By.name(\"login\"));",  // Cannot call click on driver directly
  "driver.inputText(\"username\", \"admin\");",  // No such method
  "WebDriverWait wait = new WebDriverWait(10);",  // Missing driver reference
  "driver.switch.alert().accept();",  // 'switch.alert()' is invalid
  "driver.closeAll();",  // No such method
  "driver.quitBrowser();",  // Method doesn't exist
  "driver.maximize();",  // Should be 'driver.manage().window().maximize();'
  "String pageSource = driver.pageHTML();",  // Incorrect method
  "driver.findElementByText(\"Submit\");",  // Not a valid method
  "driver.refreshPage();",  // Incorrect method
  "element.writeText(\"Hello\");",  // No 'writeText' method
  "driver.window().resize(800,600);",  // Incorrect window sizing
  "js.runScript(\"alert('Hi')\");",  // Incorrect method name
  "driver.back();",  // Method should be driver.navigate().back();
  "Select drop = new SelectBox(driver.findElement(By.id(\"list\")));",  // Wrong class name
  "driver.frame(\"mainFrame\");",  // Incomplete switchTo
  "driver.selectOption(\"Canada\");",  // No such method
  "driver.getElement(By.name(\"email\"));",  // Should be findElement
  "driver.setText(By.id(\"user\"), \"admin\");",  // Not valid
  "driver.hover(By.id(\"menu\"));",  // No direct hover method
  "wait.untilElement(By.id(\"done\"));",  // Incorrect method
  "WebDriver driver = new WebDriver();",  // Cannot instantiate interface
  "driver.getURL(\"http://test.com\");",  // Should be get()
  "actions.rightClick(By.id(\"target\")).perform();",  // Need WebElement
  "screenshot.capture(\"image.png\");",  // Invalid method
  "driver.clickElement(By.id(\"submit\"));"  // Should get element then click
];



let currentWord = "";
let score = 0;
let awarded_15 = false;
let awarded_30 = false;
let awarded_60 = false;
let timeLeft = 120;
let gameInterval;
let timerInterval;
let bonusMessageVisible = false;
let lastClickedTextValue = 0;
const normalSize = 120;

// === INSTRUCTION OVERLAY TRIGGER ===
window.onload = () => {
  document.getElementById("instructionsOverlay").style.display = "flex";
};

// === CALLED ON OK BUTTON PRESS ===
function startGameWithOverlay() {
  document.getElementById("instructionsOverlay").style.display = "none";
  startGame();
}

function createGrid() {
  const grid = document.querySelector('.grid');
  grid.innerHTML = '';
  for (let i = 0; i < 25; i++) {
    const square = document.createElement('div');
    square.classList.add('square');

    const span = document.createElement('span');
    span.textContent = textContent[i];
    square.appendChild(span);

    square.addEventListener('click', function () {
      square.classList.add('clicked');
      lastClickedTextValue = parseInt(span.textContent);
    });

    grid.appendChild(square);
  }
}

function getRandomWord() {
  if (Math.random() < 0.5) {
    currentWord = correctWords[Math.floor(Math.random() * correctWords.length)];
  } else {
    currentWord = incorrectWords[Math.floor(Math.random() * incorrectWords.length)];
  }
  return currentWord;
}

function showBonusMessage(message, color) {
  if (bonusMessageVisible) return;
  bonusMessageVisible = true;

  const bonusMessage = document.createElement('div');
  bonusMessage.classList.add('bonus-message');
  bonusMessage.textContent = message;
  bonusMessage.style.color = color;
  document.body.appendChild(bonusMessage);

  setTimeout(() => {
    bonusMessage.remove();
    bonusMessageVisible = false;
  }, 3000);
}

function startGame() {
  createGrid();
  score = 0;
  timeLeft = 120;
  awarded_15 = false;
  awarded_30 = false;
  awarded_60 = false;

  scoreDisplay.textContent = `Score: ${score}`;
  timerDisplay.textContent = `Time: ${timeLeft}s`;
  restartBtn.style.display = "none";

  wordHolder.style.cursor = "pointer";
  wordHolder.style.pointerEvents = "auto";

  wordHolder.textContent = getRandomWord();
  wordHolder.onclick = handleWordClick;

  // === Word changes every 10 seconds ===
  gameInterval = setInterval(() => {
    currentWord = getRandomWord();
    wordHolder.textContent = currentWord;
  }, 10000);

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}s`;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  circle.style.display = "none";
  restartBtn.style.display = "inline-block";
  timerDisplay.textContent = `Game Over! Final Score: ${score}`;
}

function createFireworks() {
  const fireworksContainer = document.createElement("div");
  fireworksContainer.classList.add("fireworks");

  for (let i = 0; i < 10; i++) {
    const spark = document.createElement("div");
    spark.classList.add("firework-spark");
    const angle = Math.random() * 360;
    const distance = Math.random() * 50 + 50;
    const duration = Math.random() * 0.5 + 1;
    spark.style.animationDuration = `${duration}s`;

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    spark.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;

    fireworksContainer.appendChild(spark);
  }

  document.body.appendChild(fireworksContainer);

  setTimeout(() => {
    fireworksContainer.remove();
  }, 2000);
}

function checkScoreForFireworks() {
  if (score === 15 && !awarded_15) {
    createFireworks();
    showBonusMessage("TIME-BONUS! 15s", "gold");
    timeLeft += 15;
    awarded_15 = true;
    bonusSound.currentTime = 0;
    bonusSound.play();
  }
  if (score === 30 && !awarded_30) {
    createFireworks();
    showBonusMessage("TIME-BONUS! 30s", "gold");
    timeLeft += 30;
    awarded_30 = true;
    bonusSound.currentTime = 0;
    bonusSound.play();
  }
  if (score === 60 && !awarded_60) {
    createFireworks();
    showBonusMessage("TIME-BONUS! 60s", "gold");
    timeLeft += 60;
    awarded_60 = true;
    bonusSound.currentTime = 0;
    bonusSound.play();
  }
}

function handleWordClick() {
  let hoverText = document.createElement("div");
  hoverText.classList.add("hover-feedback");

  const correctSound = document.getElementById("correct-sound");
  const clickSound = document.getElementById("click-sound");

  if (correctWords.includes(currentWord)) {
    score++;
    score += lastClickedTextValue;
    correctSound.currentTime = 0;
    correctSound.play();
    showBonusMessage("Correct!", "green");
    hoverText.textContent = "Good!";
    hoverText.style.color = "green";
  } else if (incorrectWords.includes(currentWord)) {
    score--;
    score -= lastClickedTextValue;
    clickSound.currentTime = 0;
    clickSound.play();
    showBonusMessage("Oops! That's a misspelling!", "red");
    hoverText.textContent = "Ouch!!!!";
    hoverText.style.color = "red";
  }

  const wordRect = wordHolder.getBoundingClientRect();
  hoverText.style.position = "absolute";
  hoverText.style.left = `${wordRect.left + wordRect.width / 2}px`;
  hoverText.style.top = `${wordRect.top - 20}px`;
  hoverText.style.transform = "translateX(-50%)";
  hoverText.style.fontWeight = "bold";
  hoverText.style.fontSize = "20px";
  hoverText.style.pointerEvents = "none";
  hoverText.style.zIndex = "1000";
  hoverText.style.transition = "opacity 1s ease-out, transform 1s ease-out";
  hoverText.style.opacity = "1";

  document.body.appendChild(hoverText);

  setTimeout(() => {
    hoverText.style.opacity = "0";
    hoverText.style.transform = "translateX(-50%) translateY(-30px)";
  }, 50);

  setTimeout(() => {
    hoverText.remove();
  }, 1000);

  scoreDisplay.textContent = `Score: ${score}`;
  checkScoreForFireworks();

  // Load next word immediately after click
  currentWord = getRandomWord();
  wordHolder.textContent = currentWord;
}

restartBtn.addEventListener("click", startGame);
