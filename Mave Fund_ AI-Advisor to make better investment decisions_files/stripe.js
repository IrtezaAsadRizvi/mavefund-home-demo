const BASIC_PRICE_ID = "price_1MFS3GLGZqgNQZ5xIvlOvBHN";
const PREMIUM_PRICE_ID = "price_1MFS4MLGZqgNQZ5xHKDBEze7";
const SUPER_PRICE_ID = "price_1MFS5ILGZqgNQZ5xO4f2sl1Q";


async function createCheckoutSession(priceId) {
    const response = await fetch("/api/v1/stripe/create_checkout_session", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            priceId: priceId,
        }),
    });

    return await response.json();
}


async function checkout(level) {
    let session;
    switch (level) {
        case 0:
            // basic
            session = await createCheckoutSession(BASIC_PRICE_ID);
            break;

        case 1:
            // premium
            session = await createCheckoutSession(PREMIUM_PRICE_ID);
            break;

        case 2:
            // super
            session = await createCheckoutSession(SUPER_PRICE_ID);
            break;
        default:
            alert("what are you trying to do exactly??? 🤨🤨🤨");
            break;
    }

    if (session.status === "success") {
        window.location.href = session.url;
    } else {
        alert(session.message);
    }
}