function theme(){
    var element = document.body;
    element.dataset.bsTheme = element.dataset.bsTheme == "light" ? "dark" : "light";
}

function extractBase64(input) {
    const base64Prefix = "vmess://";
    if (input.startsWith(base64Prefix)) {
        return input.substr(base64Prefix.length);
    }
    return input;
}

function decodeBase64(base64String) {
    try {
        return atob(base64String);
    } catch (error) {
        return null;
    }
}

function decodeAndDisplayData() {
    // Clear the output from generating Config YAML
    document.getElementById("templateOutput").style.display = "none";
    document.getElementById("copyButton").style.display = "none";

    const input = document.getElementById("base64Input").value;
    const base64String = extractBase64(input);
    const decodedData = decodeBase64(base64String);

    if (!decodedData) {
        TToast({text: 'Invalid Base64 string!', fontsize: 'large', color: '#FFFFFF', background: '#FF1A1A', icon: 'fas fa-times-circle'});
        return;
    }

    try {
        const dataObject = JSON.parse(decodedData);
        const outputDiv = document.getElementById("output");
        outputDiv.innerHTML = ''; // Clear previous output

        // Loop through the dataObject and display each key-value pair
        for (const key in dataObject) {
            if (dataObject.hasOwnProperty(key)) {
                const value = dataObject[key];
                const outputHTML = `
                <div class="col-sm-12">
                    <div class="input-group mt-3">
                        <span class="input-group-text"><b>${key}: </b></span>
                        <input type="text" class="form-control" value="${value}" readonly></input>
                        <button class="btn btn-group" style="background-color: var(--bs-dark-text-emphasis); color: var(--bs-body-bg)" onclick="copyToClipboard('${value}')">Copy</button>
                    </div>
                </div>
                    `;
                outputDiv.insertAdjacentHTML("beforeend", outputHTML);
            }
        }
        TToast({text: 'Success!', fontsize: 'large', color: '#FFFFFF', background: '#8080FF', icon: 'fas fa-check'});
    } catch (error) {
        TToast({text: 'Invalid JSON data after decoding Base64!', fontsize: 'large', color: '#FFFFFF', background: '#FF1A1A', icon: 'fas fa-times-circle'});
    }
}

function fillTemplate(decodedData) {
    let template = '';

    if (decodedData.port === 80) {
        template = `
- name: ${decodedData.ps}
  type: vmess
  server: ${decodedData.host}
  port: 80
  uuid: ${decodedData.id}
  alterId: ${decodedData.aid}
  cipher: auto
  udp: true
  xudp: false
  global-padding: false
  authenticated-length: false
  skip-cert-verify: true
  tls: false
  network: ${decodedData.net}
  ws-opts:
    path: "${decodedData.path}"
    headers:
      Host: ${decodedData.add}
`;
    } else if (decodedData.port === 443) {
        template = `
- name: ${decodedData.ps}
  type: vmess
  server: ${decodedData.add}
  port: 443
  uuid: ${decodedData.id}
  alterId: ${decodedData.aid}
  cipher: auto
  udp: true
  skip-cert-verify: true
  tls: true
  servername: ${decodedData.host}
  network: ws
  ws-opts:
    path: "${decodedData.path}"
    headers:
      Host: ${decodedData.host}
`;
    } else {
        template = `
- name: ${decodedData.ps}
  type: vmess
  server: ${decodedData.host}
  port: ${decodedData.port || ''}
  uuid: ${decodedData.id}
  alterId: ${decodedData.aid}
  cipher: auto
  udp: true
  xudp: false
  global-padding: false
  authenticated-length: false
  skip-cert-verify: true
  tls: false
  network: ${decodedData.net}
  ws-opts:
    path: "${decodedData.path || ''}"
    headers:
      Host: ${decodedData.add}
`;
    }

    return template;
}


function generateFilledTemplate() {
    // Clear the output from decoding Base64
    document.getElementById("output").innerHTML = "";

    const input = document.getElementById("base64Input").value;
    const base64String = extractBase64(input);
    const decodedData = decodeBase64(base64String);

    if (!decodedData) {
        TToast({text: 'Invalid Base64 string!', fontsize: 'large', color: '#FFFFFF', background: '#FF1A1A', icon: 'fas fa-times-circle'});
        return;
    }

    try {
        const dataObject = JSON.parse(decodedData);
        const template = fillTemplate(dataObject);

        // Display the filled template
        const templateOutput = document.getElementById("templateOutput");
        templateOutput.style.display = "block";
        templateOutput.value = template;

        // Display the copy button
        const copyButton = document.getElementById("copyButton");
        copyButton.style.display = "block";

        TToast({text: 'Config generated!', fontsize: 'large', color: '#FFFFFF', background: '#8080FF', icon: 'fas fa-check'});
    } catch (error) {
        TToast({text: 'Invalid JSON data after decoding Base64!', fontsize: 'large', color: '#FFFFFF', background: '#FF1A1A', icon: 'fas fa-times-circle'});
    }
}


function copyToClipboard(value) {
    const tempInput = document.createElement("input");
    tempInput.value = value;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    TToast({text: 'Copied to clipboard!', fontsize: 'large', color: '#FFFFFF', background: '#8080FF', icon: 'fas fa-check',})
}

function copyTemplateToClipboard() {
    const templateOutput = document.getElementById("templateOutput");
    templateOutput.select();
    document.execCommand("copy");
    TToast({text: 'Config copied to clipboard!', fontsize: 'large', color: '#FFFFFF', background: '#8080FF', icon: 'fas fa-check'});
}

function resetTextArea() {
    const outputDiv = document.getElementById("output");
    const templateOutput = document.getElementById("templateOutput");

    if (outputDiv.innerHTML === "" && templateOutput.style.display === "none") {
        TToast({text: 'Nothing to clear!', fontsize: 'large', color: '#FFFFFF', background: '#FF1A1A', icon: 'fas fa-times-circle'});
        return;
    }

    document.getElementById("base64Input").value = "";
    outputDiv.innerHTML = ""; // Clear the decoded data output
    templateOutput.style.display = "none"; // Hide the generated template output
    document.getElementById("copyButton").style.display = "none"; // Hide the copy button for the template
    TToast({text: 'Cleared!', fontsize: 'large', color: '#FFFFFF', background: '#8080FF', icon: 'fas fa-check'});
}

