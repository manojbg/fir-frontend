var globalOptions = {
	uri: 'http://localhost:8080/firFileArchival/api/dashboard/getSupportingDocumentData',
	host: 'http://localhost:8080/firFileArchival/api'
}

//var globalOptions = {
	//uri: 'http://10.19.202.182:8080/firFileArchival/api/dashboard/getSupportingDocumentData',
	//host: 'http://10.19.202.182:8080/firFileArchival/api'
//}

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);

  document.getElementById("caseIdentifier").textContent = params.get("firNumber");
  document.getElementById("firNumberField").textContent = params.get("firNumber");
  document.getElementById("formNameField").textContent = params.get("formName");
  document.getElementById("actionType").textContent = params.get("type");
  document.getElementById("pk").textContent = params.get("pk");
  document.getElementById("psi").textContent = params.get("psi");
  document.getElementById("ioa").textContent = params.get("ioa");
  document.getElementById("cdt").textContent = params.get("cdt");
}

function handleCloseModal(){
  window.parent.document.getElementById("form-close").click();
}

function handleModalError() {
  window.parent.document.getElementById("form-error").click();
}

function convertHtmlToPdfDirectlySinglePage(element, callback) {
  showLoader();
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
        console.error('Error in convertHtmlToPdfDirectlySinglePage:', error);
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
        console.error('Error in convertHtmlToPdfDirectlyMultiPageImageSplit:', error);
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
        if(iteration < pages.length)
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

function saveAPICall(requestPayload) {
showLoader();
  // Send the data via AJAX
  $.ajax({
     url: globalOptions.host+"/fileOps/saveFIRSupportingDocument",
     type: "POST",
     contentType: "application/json",
     async: false,
     data: JSON.stringify(requestPayload),
     success: (response) => {
         //console.log("Response:", response);
         hideLoader();
         handleCloseModal();
     },
     error: (error) => {
         console.error("Error saving data:", error);
         hideLoader();
         handleModalError();
     },
  });
}


function splitIntoPages(element)
{
  const totalHeight = element.clientHeight;
  let childrenArray = element.children;
  //a4 size page in points(po) 595 x 842
  const a4Height = 980;
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
  }
  else
  {
    for(var i=0; i < childrenArray.length; i++)
    {
     tempHeight = height + childrenArray[i].clientHeight;
     if(tempHeight <= a4Height)
     {
       elements.push(childrenArray[i]);
       height = tempHeight;
       if(i == childrenArray.length-1)
       {
         //fullTemplate.children[0].replaceChildren(...elements);
         //const page = html2canvas(fullTemplate);
         partitionedElements.push(elements);
       }
     }
     else if (childrenArray[i].className != "noSplit" && (a4Height - height > (.2 * a4Height)))
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
           var splitElementChildren = elementToSplitClone.children;
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
           elementToSplit.children.replaceChildren(...splitElementToCurrentPage);
           elements.push(elementToSplit);
           //fullTemplate.children[0].replaceChildren(...elements);
           //const page = html2canvas(fullTemplate);
           partitionedElements.push(elements);

           //create new page element and push
           elements = [];
           height = 0;
           elementToSplit.children.replaceChildren(...splitElementToNextPage);
           elements.push(elementToSplit);
         }
         else
         {
           var divInnerContent = elementToSplit.innerText;
           var characterLength = divInnerContent.length;
           var newSection = $('<div id="splitDiv"></div>');
           newSection.append(divInnerContent.substring(0,characterLength * heightToFillPercentage));
           splitElementToCurrentPage.push(newSection);
           elementToSplit.children.replaceChildren(...splitElementToCurrentPage);
           elements.push(newSection);
           fullTemplate.children[0].replaceChildren(...elements);
           //const page = html2canvas(fullTemplate);
           partitionedElements.push(fullTemplate);

           //create new page element and push
           var newSection = $('<div id="splitDiv"></div>');
           newSection.append(divInnerContent.substring((characterLength * heightToFillPercentage)+1,characterLength));
           splitElementToNextPage.push(newSection);
           elements = [];
           height = 0;
           elementToSplit.children.replaceChildren(...splitElementToNextPage);
           elements.push(elementToSplit);
         }
       }
       else if (elementToSplit.localName == "table")
       {
         var tbody = elementToSplit.children[0];

         for(var k=0;k < tbody.children.length; k++)
         {
           heightToFill = heightToFill - tbody.children[k].clientHeight;
           if(heightToFill >= 0)
           {
             height = height + tbody.children[k].clientHeight;
             splitElementToCurrentPage.push(tbody.children[k]);
           }
           else
           {
             let elementToSplitInternalClone = elementToSplit.cloneNode(true);
             //let tbodySplitClone = elementToSplit.children[0].cloneNode(true);
             //elementToSplitInternalClone.replaceChildren(tbodySplitClone);
             elementToSplitInternalClone.children[0].replaceChildren(...splitElementToCurrentPage);
             elements.push(elementToSplitInternalClone);
             //fullTemplate.children[0].replaceChildren(...elements);
             //const page = html2canvas(fullTemplate);
             partitionedElements.push(elements);

             var allChildren = [];
             splitElementToCurrentPage.forEach(ele =>{ allChildren.push(ele)});
             for (var l = 0; l < tbody.children.length; l++) {
             allChildren.push(tbody.children[l])
             }
             //tbody.replaceChildren(...allChildren);

             //reset page height and array
             splitElementToCurrentPage = [];
             k=0;
             heightToFill = a4Height - tbody.children[k].clientHeight;
             splitElementToCurrentPage.push(tbody.children[k]);
             elements = [];
             height = 0;
           }
         }
         let elementToSplitClone = elementToSplit.cloneNode(true);
        // var tbodyClone = elementToSplit.children[0].cloneNode(true);
         //elementToSplitClone.replaceChildren(tbodyClone);
         elementToSplitClone.children[0].replaceChildren(...splitElementToCurrentPage);
         elements.push(elementToSplitClone);
       }
     }
     else
     {
       //fullTemplate.children[0].replaceChildren(...elements);
       //const page = html2canvas(fullTemplate);
       partitionedElements.push(elements);
       elements = [];
       elements.push(childrenArray[i]);
       height = 0;
       //i = 0;
     }
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
      if(table.rows.length == 1 && tableId !== "table1NoHeader")
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
    if(tableId !== "table1NoHeader")
    {
      $("#"+tableId+" tr:nth-child(2)").css({ "font-weight": "bold" });
      $("#"+tableId+" tr:nth-child(2)").attr("class","headers");
    }
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

function showLoader()
{
  $('#loader-mask').css('display','block');
  $('#loader').css('display','block');

}

function hideLoader()
{
  $('#loader-mask').css('display','none');
  $('#loader').css('display','none');
}

function  setPageHeaders()
{
    $(".cenId").html("Cyber Crime Police Station, ");
    $(".cenLocation").html("North Division, Bengaluru");
    $(".cenRefBody").html("North Division");
    $(".cenCity").html("Bengaluru");
    $("#cenCDRLocation").html("No: NORTH CEN PS/CDR");
    $("#cenAddress").html("2<sup>nd</sup> Floor, Deputy Commissioner Office Building, North Division,<br/>\n" +
        "                Yeswanthapura, Bengaluru city -560022");
    a = document.getElementById("cenEmailId");
    a.setAttribute("href", "cenpsnorthbcp@ksp.gov.in");
    $("#cenEmailId").html("cenpsnorthbcp@ksp.gov.in ; ");
    $("#cenContact").html("Mob No-9480801066, 8277945187");
}




















