module.exports = {
  apps : [{
    name : 'NoNameVerse-Official',
    script: 'index.js',
    ignore_watch: ["logs/"],
    watch: true,
    watch_delay: 1000,
    restart_delay : 3000,
    log_file: "./logs/",
    log_date_format: "YYYY-MM-DD HH:mm"
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    }
  }
};
