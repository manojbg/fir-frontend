var globalOptions = {
	uri: 'http://localhost:8080/firFileArchival/api/dashboard/getSupportingDocumentData',
}

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const firNumber = params.get("firNumber");
  const formName = params.get("formName");
  const type = params.get("type");

  // Populate your form fields if needed
  document.getElementById("firNumberField").textContent = firNumber;
  document.getElementById("formNameField").textContent = formName;
  document.getElementById("actionType").textContent = type;
}

function handleCloseModal(){
  window.parent.document.getElementById("form-close").click();
}

function handleModalError() {
  window.parent.document.getElementById("form-error").click();
}

function convertHtmlToPdfDirectly(element, callback) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  // Use html2canvas to capture the element
  html2canvas(element)
    .then((canvas) => {
       const imgData = canvas.toDataURL('image/jpeg');
       const pdfWidth = pdf.internal.pageSize.getWidth();
       const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

       // Add the image to the PDF
       pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

       // Convert the PDF to a Blob
       const pdfBlob = pdf.output('blob');

       // Log Blob for debugging
       console.log('Generated PDF Blob:', pdfBlob);

       // Convert the Blob to a Base64 string
       const reader = new FileReader();
       reader.onload = function () {
         const base64String = reader.result.split(',')[1]; // Extract the Base64 part
         callback(null, base64String); // Pass the Base64 string to the callback
       };
       reader.onerror = function (error) {
         console.error('Error reading Blob:', error);
         callback(error, null); // Pass the error to the callback
       };
       reader.readAsDataURL(pdfBlob); // Read the Blob as a Base64 string
    })
    .catch((error) => {
        console.error('Error in convertHtmlToPdfDirectly:', error);
        callback(error, null); // Pass the error to the callback
    });
}

function saveAPICall(requestPayload) {
  // Send the data via AJAX
  $.ajax({
     url: "http://localhost:8080/firFileArchival/api/fileOps/saveFIRSupportingDocument",
     type: "POST",
     contentType: "application/json",
     data: JSON.stringify(requestPayload),
     success: (response) => {
         console.log("Response:", response);
         handleCloseModal();
     },
     error: (error) => {
         console.error("Error saving data:", error);
         handleModalError();
     },
 });

}



































