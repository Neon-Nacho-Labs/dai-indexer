module.exports = {
  apps: [{
    name: "importer",
    script: "./src/jobs/transaction-importer.js",
    env: {
      "DEBUG": "*"
    }
  }]
};
