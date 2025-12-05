/**
 * Deployment Readiness Check Script
 * Run: node scripts/check-deployment.js
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const checks = [];
let allPassed = true;

// Check environment variables
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
requiredEnvVars.forEach((varName) => {
  if (process.env[varName]) {
    checks.push({ name: `Environment: ${varName}`, status: "✅", message: "Set" });
  } else {
    checks.push({ name: `Environment: ${varName}`, status: "❌", message: "Missing" });
    allPassed = false;
  }
});

// Check uploads directory
const uploadsDir = path.join(process.cwd(), "uploads");
if (fs.existsSync(uploadsDir)) {
  checks.push({ name: "Uploads directory", status: "✅", message: "Exists" });
} else {
  checks.push({ name: "Uploads directory", status: "⚠️", message: "Will be created on first upload" });
}

// Check package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8"));
if (packageJson.dependencies) {
  checks.push({ name: "Dependencies", status: "✅", message: `${Object.keys(packageJson.dependencies).length} dependencies` });
}

// Check models
const modelsDir = path.join(process.cwd(), "src", "models");
if (fs.existsSync(modelsDir)) {
  const models = fs.readdirSync(modelsDir).filter(f => f.endsWith(".js"));
  checks.push({ name: "Models", status: "✅", message: `${models.length} models found` });
}

// Check routes
const routesDir = path.join(process.cwd(), "src", "routes");
if (fs.existsSync(routesDir)) {
  const routes = fs.readdirSync(routesDir).filter(f => f.endsWith(".js"));
  checks.push({ name: "Routes", status: "✅", message: `${routes.length} route files found` });
}

// Output results
console.log("\n=== Deployment Readiness Check ===\n");
checks.forEach((check) => {
  console.log(`${check.status} ${check.name}: ${check.message}`);
});
console.log("\n" + "=".repeat(40));
if (allPassed) {
  console.log("✅ All critical checks passed!");
} else {
  console.log("❌ Some checks failed. Please fix before deployment.");
}
console.log("=".repeat(40) + "\n");

process.exit(allPassed ? 0 : 1);

