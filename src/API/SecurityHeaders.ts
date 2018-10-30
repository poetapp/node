export const SecurityHeaders = {
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'same-origin' },
  contentSecurityPolicy: {
    directives: {
      scriptSrc: ['\'self\''],
    },
  },
}
