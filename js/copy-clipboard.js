// File: js/copy-clipboard.js
// Copy to Clipboard functionality for code snippets

document.addEventListener('DOMContentLoaded', function() {
    // Initialize copy buttons
    initCopyButtons();
    
    // Add demo code snippets to project cards (for demonstration)
    addDemoCodeSnippets();
    
    console.log('Copy to clipboard module loaded');
});

/**
 * Initialize all copy buttons on the page
 */
function initCopyButtons() {
    // Add event listeners to all copy buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.copy-btn')) {
            const copyBtn = e.target.closest('.copy-btn');
            const codeContent = copyBtn.closest('.code-snippet-container')?.querySelector('.code-content');
            
            if (codeContent) {
                copyToClipboard(codeContent, copyBtn);
            }
        }
    });
}

/**
 * Copy code content to clipboard
 */
function copyToClipboard(codeElement, buttonElement) {
    // Get the text to copy (strip HTML tags for clean text)
    let textToCopy = '';
    
    if (codeElement.querySelector('code')) {
        // If there's a <code> element inside, use its text
        textToCopy = codeElement.querySelector('code').innerText;
    } else {
        // Otherwise use the element's text content
        textToCopy = codeElement.textContent;
    }
    
    // Clean up the text (remove extra whitespace)
    textToCopy = textToCopy.trim();
    
    // Use Clipboard API
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            // Show success state
            showCopySuccess(buttonElement);
            showNotification('Code copied to clipboard!');
            
            // Log for debugging
            console.log('Copied to clipboard:', textToCopy.substring(0, 50) + '...');
        })
        .catch(err => {
            // Fallback for older browsers
            console.error('Clipboard API failed:', err);
            fallbackCopyToClipboard(textToCopy, buttonElement);
        });
}

/**
 * Fallback method for older browsers
 */
function fallbackCopyToClipboard(text, buttonElement) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopySuccess(buttonElement);
            showNotification('Code copied to clipboard!');
        } else {
            showCopyError(buttonElement, 'Failed to copy');
        }
    } catch (err) {
        showCopyError(buttonElement, 'Error: ' + err);
        console.error('Fallback copy failed:', err);
    }
    
    document.body.removeChild(textArea);
}

/**
 * Show success state on copy button
 */
function showCopySuccess(buttonElement) {
    const originalHTML = buttonElement.innerHTML;
    const originalText = buttonElement.querySelector('.btn-text')?.textContent || 'Copy';
    
    // Update button state
    buttonElement.innerHTML = '<i class="fas fa-check"></i> <span class="btn-text">Copied!</span>';
    buttonElement.classList.add('copied');
    
    // Reset button after 2 seconds
    setTimeout(() => {
        buttonElement.innerHTML = originalHTML;
        buttonElement.classList.remove('copied');
    }, 2000);
}

/**
 * Show error state on copy button
 */
function showCopyError(buttonElement, message) {
    const originalHTML = buttonElement.innerHTML;
    
    // Update button state
    buttonElement.innerHTML = `<i class="fas fa-times"></i> <span class="btn-text">${message}</span>`;
    buttonElement.classList.add('error');
    
    // Reset button after 3 seconds
    setTimeout(() => {
        buttonElement.innerHTML = originalHTML;
        buttonElement.classList.remove('error');
    }, 3000);
}

/**
 * Show notification message
 */
function showNotification(message) {
    // Remove existing notification
    const existingNotification = document.querySelector('.copy-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i> ${message}
    `;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 255, 136, 0.9);
        color: #000;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s ease;
        box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/**
 * Add demo code snippets to project cards for demonstration
 */
function addDemoCodeSnippets() {
    // Only add if on projects page and if demo snippets don't exist
    if (!document.querySelector('.project-card') || document.querySelector('.code-snippet-container')) {
        return;
    }
    
    const projectCards = document.querySelectorAll('.project-card');
    
    // Sample code snippets for different project types
    const codeSnippets = {
        web: {
            language: 'HTML',
            code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pixel Phantoms</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body class="hacker-theme">
    <header class="cyber-header">
        <h1 class="glitch-text" data-text="SYSTEM_ONLINE">
            SYSTEM_ONLINE
        </h1>
        <nav class="nav-terminal">
            <a href="#home" class="nav-link">> HOME</a>
            <a href="#projects" class="nav-link active">> PROJECTS</a>
            <a href="#leaderboard" class="nav-link">> LEADERBOARD</a>
        </nav>
    </header>
    
    <main id="main-content">
        <section class="hero">
            <div class="terminal-box">
                <p class="console-line">> Initializing system...</p>
                <p class="console-line success">> Welcome back, Phantom.</p>
            </div>
        </section>
    </main>
    
    <script src="app.js"></script>
</body>
</html>`
        },
        ai: {
            language: 'Python',
            code: `import tensorflow as tf
import numpy as np

class NeuralPhantom:
    """AI Model for Phantom Bot"""
    
    def __init__(self, model_name="phantom_v2"):
        self.model_name = model_name
        self.model = self.build_model()
        self.training_data = []
        
    def build_model(self):
        """Construct neural network architecture"""
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(128, activation='relu', 
                                 input_shape=(784,)),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dense(10, activation='softmax')
        ])
        
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def train(self, X_train, y_train, epochs=10):
        """Train the model"""
        history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            validation_split=0.2,
            verbose=1
        )
        return history
    
    def predict(self, input_data):
        """Make prediction"""
        return self.model.predict(input_data)

# Initialize the model
phantom_ai = NeuralPhantom()
print(f"[{phantom_ai.model_name}] Neural network initialized")`
        },
        app: {
            language: 'Dart',
            code: `import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(CampusConnectApp());
}

class CampusConnectApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Campus Connect',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: DashboardScreen(),
    );
  }
}

class DashboardScreen extends StatefulWidget {
  @override
  _DashboardScreenState createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedIndex = 0;
  
  final List<Widget> _screens = [
    HomeScreen(),
    ScheduleScreen(),
    GradesScreen(),
    ProfileScreen(),
  ];
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Campus Connect'),
        backgroundColor: Colors.deepPurple,
        elevation: 0,
      ),
      body: _screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.schedule),
            label: 'Schedule',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.grade),
            label: 'Grades',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}`
        },
        hardware: {
            language: 'C++',
            code: `#include <Arduino.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Pin definitions
#define DHT_PIN 2
#define LED_PIN 13
#define LDR_PIN A0
#define BUZZER_PIN 8

// Initialize sensors
DHT dht(DHT_PIN, DHT22);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Threshold values
const float TEMP_THRESHOLD = 25.0;    // °C
const float HUMIDITY_THRESHOLD = 60.0; // %
const int LIGHT_THRESHOLD = 500;       // Lux

void setup() {
  Serial.begin(9600);
  Serial.println("> Smart Lab Matrix Initializing...");
  
  // Initialize components
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LDR_PIN, INPUT);
  
  dht.begin();
  lcd.init();
  lcd.backlight();
  
  Serial.println("> System Online");
  lcd.setCursor(0, 0);
  lcd.print("System: ONLINE");
  delay(1000);
}

void loop() {
  // Read sensor data
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int lightLevel = analogRead(LDR_PIN);
  
  // Display on LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("T:");
  lcd.print(temperature);
  lcd.print("C H:");
  lcd.print(humidity);
  lcd.print("%");
  
  lcd.setCursor(0, 1);
  lcd.print("Light:");
  lcd.print(lightLevel);
  
  // Control logic
  if (temperature > TEMP_THRESHOLD) {
    digitalWrite(LED_PIN, HIGH);
    triggerCoolingSystem();
  } else {
    digitalWrite(LED_PIN, LOW);
  }
  
  if (lightLevel < LIGHT_THRESHOLD) {
    activateEmergencyLighting();
  }
  
  // Send data to server
  sendDataToServer(temperature, humidity, lightLevel);
  
  delay(5000); // Read every 5 seconds
}

void triggerCoolingSystem() {
  Serial.println("> Cooling system activated");
  // Add cooling logic here
}

void activateEmergencyLighting() {
  Serial.println("> Emergency lighting activated");
  // Add lighting logic here
}

void sendDataToServer(float temp, float hum, int light) {
  // Send data via WiFi or Bluetooth
  Serial.print("DATA:");
  Serial.print(temp);
  Serial.print(",");
  Serial.print(hum);
  Serial.print(",");
  Serial.println(light);
}`
        }
    };
    
    // Add code snippets to each project card
    projectCards.forEach((card, index) => {
        const category = card.getAttribute('data-category');
        if (codeSnippets[category]) {
            const snippet = codeSnippets[category];
            
            // Create code snippet container
            const codeContainer = document.createElement('div');
            codeContainer.className = 'code-snippet-container';
            codeContainer.innerHTML = `
                <div class="code-header">
                    <span class="code-language">${snippet.language}</span>
                    <button class="copy-btn">
                        <i class="fas fa-copy"></i>
                        <span class="btn-text">Copy</span>
                    </button>
                </div>
                <div class="code-content">
                    <code>${escapeHtml(snippet.code)}</code>
                </div>
            `;
            
            // Insert after the tech stack tags
            const techStack = card.querySelector('.tech-stack-terminal');
            if (techStack) {
                techStack.parentNode.insertBefore(codeContainer, techStack.nextSibling);
            }
        }
    });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Create a code snippet manually (can be called from other scripts)
 */
function createCodeSnippet(code, language = 'JavaScript', containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return null;
    
    const codeContainer = document.createElement('div');
    codeContainer.className = 'code-snippet-container';
    codeContainer.innerHTML = `
        <div class="code-header">
            <span class="code-language">${language}</span>
            <button class="copy-btn">
                <i class="fas fa-copy"></i>
                <span class="btn-text">Copy</span>
            </button>
        </div>
        <div class="code-content">
            <code>${escapeHtml(code)}</code>
        </div>
    `;
    
    container.appendChild(codeContainer);
    return codeContainer;
}

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
    window.copyClipboard = {
        init: initCopyButtons,
        createSnippet: createCodeSnippet,
        copyToClipboard: copyToClipboard
    };
}