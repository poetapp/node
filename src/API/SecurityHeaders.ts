export const securityHeaders = {
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'same-origin' },
  contentSecurityPolicy: {
    directives: {
      scriptSrc: ["'self'"],
    },
  },
}
