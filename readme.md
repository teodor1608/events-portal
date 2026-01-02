To test the locally you need to:
add .env on the backend with:
    JWT_SECRET=
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    GOOGLE_REDIRECT_URI=http://localhost:4200/login/callback
    STRIPE_SECRET_KEY=
    STRIPE_PUBLIC_KEY=
    STRIPE_SUCCESS_URL=http://localhost:4200/payment/success
    STRIPE_CANCEL_URL=http://localhost:4200/payment/cancel
    STRIPE_WEBHOOK_SECRET=
    SENDGRID_API_KEY=
    MAIL_FROM=sender <sender@domain.com>
    CHECKIN_BASE_URL=http://localhost:4200/checkin
install and run the stripe cli executing the following:
    stripe login (while making sure you authorize for the correct app)
    stripe listen --forward-to localhost:3000/api/payments/webhook
    stripe trigger checkout.session.completed (to test for connection in case it doesnt work right off)

to make yourself admin you may ask copilot or run the script in backend/scripts/run-sql.js in the terminal