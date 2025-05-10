# SmartPharm Project

SmartPharm is a project developed using React and JSON server for simplicity. This guide will help you set up and run the application locally on your machine.

## Setup Instructions

### 1. Clone the Project
First, open your terminal and navigate to the directory where you want to clone the project. Then enter the following command:
```bash
git clone https://github.com/KristinaKitanovic/SmartPharm.git
```
### 2. Navigate to the Project Folder
After the project is cloned, navigate to the project folder:
```bash
cd SmartPharm
```
### 3. Open the Project in VS Code
In the same terminal, enter the following command to open the project in Visual Studio Code:
```bash
code .
```
### 4. Install Dependencies
Once the project is opened in VS Code, open a terminal within VS Code and run the following command to install the dependencies:
```bash
npm install
```
### 5. Start the React Development Server
After the dependencies are installed, enter the following command in the terminal to start the development server:
```bash
npm start
```
### 6. Start the JSON Server
Open two new terminals (e.g., PowerShell), and in the first terminal, run the following command to start the JSON server:
```bash
json-server --watch db.json --port 5000
```
In the second terminal, run the following command to start the React app:
```bash
npm run dev
```
### The Application is Running
Enjoy using the SmartPharm application!
