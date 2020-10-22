module.exports = ({ env }) => ({
  host: env("HOST", "localhost"),
  port: env.int("PORT", 443),
  url: "https://hkirs-tvp-web.web.app",
  admin: {
    auth: {
      secret: env("ADMIN_JWT_SECRET", "d7f654810d7fb851a058175ea13aff5b"),
    },
  },
});
