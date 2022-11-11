module.exports = {
  apps: [{
    name: "importer",
    script: "./src/jobs/transaction-importer.ts",
    env: {
      "DEBUG": "*"
    }
  }]
};
