var globalOptions = {
	uri: 'http://localhost:8080/firFileArchival/api/dashboard/getSupportingDocumentData',
}

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const firNumber = params.get("firNumber");
  const formName = params.get("formName");
  const type = params.get("type");
  const pk = params.get("pk");

  // Populate your form fields if needed
  document.getElementById("firNumberField").textContent = firNumber;
  document.getElementById("formNameField").textContent = formName;
  document.getElementById("actionType").textContent = type;
  document.getElementById("pk").textContent = pk;
}

function handleCloseModal(){
  window.parent.document.getElementById("form-close").click();
}

function handleModalError() {
  window.parent.document.getElementById("form-error").click();
}

function convertHtmlToPdfDirectlySinglePage(element, callback) {
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
       //console.log('Generated PDF Blob:', pdfBlob);

       // Convert the Blob to a Base64 string
       const reader = new FileReader();
       reader.onload = function () {
         const base64String = reader.result.split(',')[1]; // Extract the Base64 part
         //console.log("bytearray for pdf", base64String);
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

function convertHtmlToPdfDirectlyMultiPageImageSplit(element, callback) {
  const { jsPDF } = window.jspdf;
  //const pdf = new jsPDF();
var pdf = new jsPDF('p', 'mm', 'a4');
  // Use html2canvas to capture the element
  html2canvas(element)
    .then((canvas) => {
          var imgWidth = pdf.internal.pageSize.getWidth();
          var pageHeight = pdf.internal.pageSize.getHeight();
          var imgHeight = canvas.height * imgWidth / canvas.width;
          //var imgHeight = pdf.internal.pageSize.getHeight();
          var heightLeft = imgHeight;


          var position = 0;
          var pageData = canvas.toDataURL('image/jpeg', 1.0);
          var imgData = encodeURIComponent(pageData);
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          pdf.setLineWidth(20);
          pdf.setDrawColor(255, 255, 255);
          pdf.rect(0, 0, 210, 295);
          heightLeft -= pageHeight;

          while (heightLeft > 0) {
            position = heightLeft - imgHeight + 20;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            pdf.setLineWidth(20);
            pdf.setDrawColor(255, 255, 255);
            pdf.rect(0, 0, 210, 295);
            heightLeft -= pageHeight;
          }

       // Convert the PDF to a Blob
       const pdfBlob = pdf.output('blob');

       // Log Blob for debugging
       //console.log('Generated PDF Blob:', pdfBlob);

       // Convert the Blob to a Base64 string
       const reader = new FileReader();
       reader.onload = function () {
         const base64String = reader.result.split(',')[1]; // Extract the Base64 part
         //console.log("bytearray for pdf", base64String);
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

function convertHtmlToPdfDirectly(element, callback) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  var elements = splitIntoPages(element.children[0]);
  var iteration = 0;
  const pages = elements.map(ele => {
    element.children[0].replaceChildren(...ele);
    return html2canvas(element)});

  Promise.all(pages)
    .then(canvases => {
      for (const canvas of canvases)
      {
        const imgData = canvas.toDataURL('image/jpeg');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        // Add the image to the PDF
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        iteration += 1;
        if(iteration < elements.length)
         {
         pdf.addPage();
         }
      }
      // Convert the PDF to a Blob
      const pdfBlob = pdf.output('blob');

      // Log Blob for debugging
      //console.log('Generated PDF Blob:', pdfBlob);

      // Convert the Blob to a Base64 string
      const reader = new FileReader();
      reader.onload = function () {
        const base64String = reader.result.split(',')[1]; // Extract the Base64 part
        //console.log("bytearray for pdf", base64String);
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

function saveAPICall(requestPayload, print) {
  // Send the data via AJAX
  $.ajax({
     url: "http://localhost:8080/firFileArchival/api/fileOps/saveFIRSupportingDocument",
     type: "POST",
     contentType: "application/json",
     data: JSON.stringify(requestPayload),
     success: (response) => {
         //console.log("Response:", response);
         if(print)
         {
            js:window.print();
         }
         handleCloseModal();
     },
     error: (error) => {
         console.error("Error saving data:", error);
         handleModalError();
     },
 });

}

function splitIntoPages(element)
{
  const totalHeight = element.clientHeight;
  var childrenArray = element.children;
  var a4Height = 840;
  var elements = [];
  var partitionedElements = [];
  var height = 0;
  if(totalHeight <= a4Height)
  {
    for(var i=0; i < childrenArray.length; i++)
    {
      elements.push(childrenArray[i]);
    }
    partitionedElements.push(elements);
    return partitionedElements;
  }
  for(var i=0; i < childrenArray.length; i++)
  {
     tempHeight = height + childrenArray[i].clientHeight;
     if(tempHeight <= a4Height)
     {
       elements.push(childrenArray[i]);
       height = tempHeight;
       if(i == childrenArray.length-1)
       {
         partitionedElements.push(elements);
       }
     }
     else if (childrenArray[i].className != "noSplit" && (a4Height - height > (.2 * childrenArray[i].clientHeight)))
     {
        var elementToSplit = childrenArray[i];
        var heightToFill = a4Height - height;
        var heightToFillPercentage = (elementToSplit.clientHeight - heightToFill / heightToFill );
        var splitElementToCurrentPage = [];
        var splitElementToNextPage = [];
       //split element
       if(elementToSplit.localName == "div")
       {
         if(elementToSplit.children > 1)
         {
         var splitElementChildren = elementToSplit.children;
           for(var j=0;j < splitElementChildren.length; j++)
           {
             heightToFill = heightToFill - splitElementChildren[j].clientHeight;
             if(heightToFill >= 0)
             {
              splitElementToCurrentPage.push(elementToSplit.children[j]);
             }
             else
             {
              splitElementToNextPage.push(elementToSplit.children[j]);
             }
           }
           elementToSplit.children = splitElementToCurrentPage;
           elements.push(elementToSplit);
           partitionedElements.push(elements);

           //create new page element and push
           elements = [];
           height = 0;
           elementToSplit.children = splitElementToNextPage;
           elements.push(elementToSplit);
         }
       else
       {
          var divInnerContent = elementToSplit.innerText;
          var characterLength = divInnerContent.length;
          var newSection = $('<div id="splitDiv"></div>');
          newSection.append(divInnerContent.substring(0,characterLength * heightToFillPercentage));
          splitElementToCurrentPage.push(newSection);
           elementToSplit.children = splitElementToCurrentPage;
           elements.push(newSection);
           partitionedElements.push(elements);

           //create new page element and push
           var newSection = $('<div id="splitDiv"></div>');
          newSection.append(divInnerContent.substring((characterLength * heightToFillPercentage)+1,characterLength));
          splitElementToNextPage.push(newSection);
           elements = [];
           height = 0;
           elementToSplit.children = splitElementToNextPage;
           elements.push(elementToSplit);
       }
       }
       else if (elementToSplit.localName == "table")
       {
         var splitElementChildren = elementToSplit.children;
         for(var k=0;k < splitElementChildren[0].length; k++)
         {
             heightToFill = heightToFill - splitElementChildren.children[k].clientHeight;
             if(heightToFill >= 0)
             {
              splitElementToCurrentPage.push(splitElementChildren.children[k]);
             }
             else
             {
              splitElementToNextPage.push(splitElementChildren.children[k]);
             }
         }
       }
     }
     else
     {
       partitionedElements.push(elements);
       elements = [];
       elements.push(childrenArray[i]);
       height = 0;
     }
  }
  return partitionedElements;
}

function populateTable(tableId, data)
{
  if(data !== null)
  {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = ""; // Clear existing rows

    const deleteColumnBtnRow = $('<tr class="deleteColumnBtnRow"></tr>');
    for(let i=0; i < Object.keys(data[0]).length; i++)
    {
      deleteColumnBtnRow.append("<td><button class='removeColumnBtn'>Delete <br/> Column</button></td>");
    }
    deleteColumnBtnRow.append("<td><button class='addColumnBtnAfter' onclick='addColumn()'>Add <br/> Column</button></td>");
    $("#"+tableId+" tbody").append(deleteColumnBtnRow);
    data.forEach(row => {
      const newRow = $('<tr></tr>');
      Object.keys(row).forEach(function(key,index) {
          newRow.append("<td><div class='background-edit' contenteditable>"+row[key]+"</div></td>");
      });
      if(table.rows.length == 1)
      {
        newRow.append("<td>ACTIONS</td>");
      }
      else
      {
        newRow.append('<td><button class="removeBtn">Delete <br> Row</button></td>');
      }
      $("#"+tableId+" tbody").append(newRow);
    });
    $("#"+tableId+" tr:first").attr("class","deleteColumnBtnRow");
    $("#"+tableId+" tr:nth-child(2)").css({ "font-weight": "bold" });
    $("#"+tableId+" tr:nth-child(2)").attr("class","headers");
    $("#"+tableId+" tr > *:last-child").css("width","90px");
  }
}

// Function to extract table data as an array of objects
function getTableData(tableId) {
  const data = [];
  const table = document.getElementById(tableId);
  if(table !== null)
  {
    const rows = table.querySelectorAll("tbody tr");
    rows.forEach(row => {
      const cells = row.querySelectorAll("td");
      if (cells.length > 1) {
        var rowData = {};
        cells.forEach(cell => rowData[cell.cellIndex] = cell.innerText.trim());
        data.push(rowData);
     }
    });
  }
  return data;
}




















