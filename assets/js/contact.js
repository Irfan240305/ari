/* ARI Softech Solutions — Contact Us form
   Submits the on-page form to the Contact Us Google Form only.
   Keep this configuration separate from any other Google Form used by the business. */
(function(){
    "use strict";

    var form = document.getElementById("contactForm");
    if(!form) return;

    var formStatus = document.getElementById("formStatus");
    var formFrame = document.getElementById("googleFormResponse");
    var submitButton = document.getElementById("contactSubmit");

    /* Contact Us Google Form (formResponse endpoint + question entry IDs) */
    var googleFormResponseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSev10CTVLVmKFfg21BI2jx7LM_HKSfZkKeQkE1v95C1-H6smA/formResponse";
    var googleFormEntryIds = {
        fullName: "1497535901",
        email: "185655657",
        phone: "1278317214",
        company: "642034361",
        subject: "303616225",
        inquiryType: "658851703",
        message: "302160413"
    };

    var submitting = false;

    function setStatus(message, type){
        formStatus.textContent = message;
        formStatus.classList.toggle("is-error", type === "error");
        formStatus.classList.toggle("is-success", type === "success");
    }

    function markInvalidFields(){
        var firstInvalid = null;
        form.querySelectorAll("[data-google-entry]").forEach(function(field){
            var valid = field.checkValidity();
            field.setAttribute("aria-invalid", String(!valid));
            if(!valid && !firstInvalid) firstInvalid = field;
        });
        return firstInvalid;
    }

    form.querySelectorAll("[data-google-entry]").forEach(function(field){
        field.addEventListener("input", function(){
            if(field.getAttribute("aria-invalid") === "true" && field.checkValidity()){
                field.setAttribute("aria-invalid", "false");
            }
        });
    });

    form.addEventListener("submit", function(event){
        event.preventDefault();

        var firstInvalid = markInvalidFields();
        if(firstInvalid){
            setStatus("Please complete the highlighted fields.", "error");
            firstInvalid.focus();
            form.reportValidity();
            return;
        }

        var configured = googleFormResponseUrl.indexOf("https://docs.google.com/forms/") === 0
            && Object.keys(googleFormEntryIds).every(function(key){ return /^\d+$/.test(googleFormEntryIds[key]); });

        if(!configured){
            setStatus("The contact form is temporarily unavailable. Please reach us by email or phone instead.", "error");
            return;
        }

        form.action = googleFormResponseUrl;
        form.querySelectorAll("[data-google-entry]").forEach(function(field){
            field.name = "entry." + googleFormEntryIds[field.dataset.googleEntry];
        });

        setStatus("Sending your message…");
        submitButton.disabled = true;
        submitting = true;
        form.submit();
    });

    formFrame.addEventListener("load", function(){
        if(!submitting) return;
        submitting = false;
        submitButton.disabled = false;
        form.reset();
        form.querySelectorAll("[aria-invalid]").forEach(function(field){
            field.removeAttribute("aria-invalid");
        });
        setStatus("Thank you — your message has been sent. Our team will get back to you soon.", "success");
    });
})();
