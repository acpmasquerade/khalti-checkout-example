// basic requests debugging. 
// displays info below the product listing
function debuginfo(alertclass, msg) {
    var _msg = $("<div class='alert'></div>");
    _msg.append(msg);
    _msg.addClass("alert-" + alertclass);
    $("#alert-content").append(_msg);
}

// receive token and ajax call to server side script,
// which then calls to khalti api for the payment verification
function verifyKhaltiPayment(payload, amt, targetBtn) {
    var token = payload.token;
    var amount = payload.amount;
    var self = $(targetBtn);

    debuginfo("success", "Payment token received = " + token);

    // ajax call
    $.post("verify.php", payload, function (resp) {
        debuginfo("success", "Payment verification response : <br /><pre>" + resp + "</pre>");
        self.removeClass("disabled");
        self.text("Payment verified");
        self.removeClass("btn-danger").addClass("btn-success");
    })
}

$(function () {
    $(".pay-khalti").on('click', function (e) {
        e.preventDefault();
        var self = $(e.target);
        console.log(e, "Clickedd !!!! ");

        var id = self.attr("id");

        self.text("Loading...");
        self.addClass("disabled");
        var amt = parseInt(self.data('amount')) * 100; // amount is in paisa
        var config = {
            // replace the publicKey with yours
            "publicKey": "KHALTI_MERCHANT_PUBLIC_KEY",
            "productIdentity": "product-" + id, // some dummy product id
            "productName": "Dragon " + id,
            "productUrl": "http://gameofthrones.wikia.com/wiki/Dragons#" + id,
            "merchant_button_id": id,
            "eventHandler": {
                onSuccess(payload) {
                    debuginfo("success", "Success callback received. <br />" + JSON.stringify(payload));
                    // hit merchant api for initiating verfication
                    console.log(payload);
                    self.text("Verifying payments ...");

                    // verify from server side to complete the payment.
                    verifyKhaltiPayment(payload, amt, e.target);
                    $("#khalt-widget").remove();
                },
                onError(error) {
                    console.log(error);
                    debuginfo("danger", "Error callback received. <br />" + JSON.stringify(error));
                    self.text("Payment failed");
                    self.addClass("btn-danger").removeClass("btn-success").removeClass("disabled");
                    $("#khalt-widget").remove();
                }
            }
        };

        // initiate KhaltiCheckout on the button click.
        var checkout = new KhaltiCheckout(Object.assign({}, config));
        checkout.show({ 'amount': amt });
    });
});