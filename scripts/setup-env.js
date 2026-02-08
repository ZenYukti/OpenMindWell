import fs from "fs";
import path from "path";
import inquirer from "inquirer";

const ROOT = process.cwd();

const resolvePath = (p) => path.resolve(ROOT, p);

const readTemplate = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing template file: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf-8");
};

const writeEnv = (filePath, content) => {
  if (fs.existsSync(filePath)) {
    console.log(`⚠️  ${filePath} already exists — skipping`);
    return;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, { encoding: "utf-8" });
  console.log(`✅ Created ${filePath}`);
};

const replaceValue = (env, key, value) => {
  const regex = new RegExp(`^${key}=.*$`, "m");

  if (!regex.test(env)) {
    throw new Error(`Key "${key}" not found in template`);
  }

  return env.replace(regex, `${key}=${value}`);
};

(async () => {
  try {
    console.log("\nOpenMindWell environment setup\n");

    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "SUPABASE_URL",
        message: "Supabase Project URL:",
        filter: (v) => v.trim(),
        validate: (v) =>
          v.startsWith("https://") && v.includes("supabase.co")
            ? true
            : "Enter a valid Supabase URL",
      },
      {
        type: "input",
        name: "SUPABASE_ANON_KEY",
        message: "Supabase Anon Public Key:",
        filter: (v) => v.trim(),
        validate: (v) =>
          v.length > 40 ? true : "Key looks too short",
      },
      {
        type: "input",
        name: "SUPABASE_SERVICE_ROLE_KEY",
        message: "Supabase Service Role Key:",
        filter: (v) => v.trim(),
        validate: (v) =>
          v.length > 40 ? true : "Key looks too short",
      },
      {
        type: "input",
        name: "HUGGINGFACE_API_TOKEN",
        message: "HuggingFace API Token (optional):",
        filter: (v) => v.trim(),
      },
    ]);

    
    // Backend 
    let backendEnv = readTemplate(
      resolvePath("backend/.env.example")
    );

    backendEnv = replaceValue(
      backendEnv,
      "SUPABASE_URL",
      answers.SUPABASE_URL
    );

    backendEnv = replaceValue(
      backendEnv,
      "SUPABASE_ANON_KEY",
      answers.SUPABASE_ANON_KEY
    );

    backendEnv = replaceValue(
      backendEnv,
      "SUPABASE_SERVICE_ROLE_KEY",
      answers.SUPABASE_SERVICE_ROLE_KEY
    );

    backendEnv = replaceValue(
      backendEnv,
      "HUGGINGFACE_API_TOKEN",
      answers.HUGGINGFACE_API_TOKEN || ""
    );

    writeEnv(
      resolvePath("backend/.env"),
      backendEnv
    );

    // frontend 
    let frontendEnv = readTemplate(
      resolvePath("frontend/.env.example")
    );

    frontendEnv = replaceValue(
      frontendEnv,
      "VITE_SUPABASE_URL",
      answers.SUPABASE_URL
    );

    frontendEnv = replaceValue(
      frontendEnv,
      "VITE_SUPABASE_ANON_KEY",
      answers.SUPABASE_ANON_KEY
    );

    writeEnv(
      resolvePath("frontend/.env"),
      frontendEnv
    );

    console.log("\n🎊Environment setup complete!");
    console.log("Run: npm run dev\n");
  } catch (err) {
    console.error("\nSetup failed:");
    console.error(err.message);
    process.exit(1);
  }
})();
