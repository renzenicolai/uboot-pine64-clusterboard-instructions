let editorContent = [];

let clusterboard = new Uint8Array( [230,1,38,27,0,0,39,27,0,0,63,19,48,0,62,19,14,0,31,34,5,0,1,34,0,7,5,34,130,139,6,34,203,5,31,34,2,0,4,34,194,128,5,34,56,9,31,34,3,0,18,34,210,196,13,34,7,2,31,34,1,0,7,34,126,38,28,34,247,229,27,34,36,4,31,34,5,0,5,34,246,255,6,34,128,0,5,34,0,128,6,34,224,248,6,34,0,224,6,34,224,225,6,34,172,1,6,34,8,36,6,34,139,224,6,34,247,132,6,34,228,32,6,34,132,139,6,34,5,252,5,34,144,139,6,34,0,128,5,34,146,139,6,34,0,128,8,34,250,255,2,34,101,50,5,34,246,255,6,34,243,0,31,34,0,0,31,34,7,0,30,34,66,0,24,34,0,0,30,34,45,0,24,34,16,240,31,34,0,0,63,19,16,0,62,19,254,15,127,32,2,0,121,32,0,2,127,32,0,0,3,18,0,255,0,18,196,127,29,18,22,252,30,18,224,7,31,18,185,4,32,18,149,4,33,18,161,4,34,18,125,4,35,18,185,4,36,18,149,4,37,18,161,4,38,18,125,4,39,18,68,1,40,18,56,1,47,18,68,1,48,18,56,1,41,18,32,0,42,18,12,0,49,18,48,0,50,18,36,0,25,2,24,0,0,2,32,0,1,2,76,0,2,2,76,0,3,2,76,0,4,2,76,0,5,2,76,0,6,2,76,0,7,2,76,0,24,2,50,0,8,2,208,7,9,2,208,7,10,2,208,7,11,2,208,7,12,2,208,7,13,2,208,7,14,2,208,7,15,2,208,7,16,2,208,7,17,2,208,7,18,2,208,7,19,2,208,7,20,2,208,7,21,2,208,7,22,2,208,7,23,2,208,7,0,9,0,0,1,9,0,0,2,9,0,0,3,9,0,0,101,8,16,50,102,8,84,118,123,8,0,0,124,8,0,255,125,8,0,0,126,8,0,0,1,8,0,1,2,8,0,1,32,10,64,32,33,10,64,32,34,10,64,32,35,10,64,32,36,10,64,32,37,10,64,32,38,10,64,32,39,10,64,32,40,10,64,32,41,10,64,32,3,27,2,0]);

function parseEeprom(array) {
    let view = new DataView(array.buffer);
    if (view.byteLength < 2) {
        throw Error("EEPROM image corrupt: too small to contain length field");
    }
    let readLength = view.getUint16(0, true);
    if (view.byteLength < readLength) {
        throw Error("EEPROM image corrupt: image is smaller than length indicated by length field");
    }
    let result = [];
    for (let index = 2; index < readLength; index += 4) {
        let address = view.getUint16(index, true);
        let value = view.getUint16(index + 2, true);
        result.push({
            address: address,
            value: value
        });
    }
    return result;
}

function createEeprom(instructions) {
    let array = new Uint8Array(1024);
    let view = new DataView(array.buffer);
    for (let index = 0; index < array.length / 2; index++) {
        view.setUint16(index * 2, 0xFFFF, true);
    }
    let maxLength = (1024 - 2) / 4; // 1KB of EEPROM, 2 bytes for length, 4 bytes per entry
    if (instructions.length > maxLength) {
        throw Error("Instruction list too large, can't fit in 1KB EEPROM chip");
    }
    let addressOfLastEntry = 2 + (instructions.length) * 4;
    view.setUint16(0, addressOfLastEntry, true);
    let position = 2;
    for (let index = 0; index < instructions.length; index++) {
        view.setUint16(position, instructions[index].address, true);
        view.setUint16(position + 2, instructions[index].value, true);
        position += 4;
    }
    return array;
}

function openDefault() {
    //editorContent = parseEeprom(clusterboard);
    editorRender();
}

function openClusterboard() {
    editorContent = parseEeprom(clusterboard);
    editorRender();
}

function nameDropdownRender(index, address) { // Too slow, need to find different solution
    let dropdown = "<select id=\"addressselect-" + index + "\" onchange=\"changeAddress(" + index + ");\">";
    dropdown += "<option value=\"unknown\"" + ((address in registerNames) ? "" : " selected") + ">unknown</option>";
    for (let item in registerNames) {
        dropdown += "<option value=\""+item.toString(16)+"\"" + ((address===item) ? "" : " selected") + ">" + registerNames[item] + "</option>";
    }
    dropdown += "</select>";
    return dropdown;
}

function editorRender() {
    let editor = document.getElementById("editor");
    let table = "<table><tr><th>Index</th><th>Register address</th><th>Register name</th><th>Value</th><th>&nbsp;</th></tr>";
    for (let index = 0; index < editorContent.length; index++) {
        let address = editorContent[index].address;
        let value = editorContent[index].value;
        table += "<tr>";
        table += "<td>"+index+"</td>";
        table += "<td>0x<input onfocusout=\"editorEdit();\" type=\"text\" id=\"address-" + index + "\" value=\"" + address.toString(16) + "\"/></td>";
        table += "<td>" + ((address in registerNames) ? registerNames[address] : "<i>Unknown</i>") + "</td>";
        table += "<td>0x<input onfocusout=\"editorEdit();\" type=\"text\" id=\"value-" + index + "\" value=\"" + value.toString(16) + "\"/></td>";
        table += "<td><a href=\"#\" onclick=\"editorRemove(" + index + ");\">X</a></td>";
        table += "</tr>";
    }
    table += "</table>";
    editor.innerHTML = table;
}

function editorEdit() {
    for (let index = 0; index < editorContent.length; index++) {
        try {
            editorContent[index].address = parseInt(document.getElementById("address-" + index).value, 16);
        } catch (error) {
            editorContent[index].address = 0;
        }
        try {
            editorContent[index].value = parseInt(document.getElementById("value-" + index).value, 16);
        } catch (error) {
            editorContent[index].value = 0;
        }
    }
    editorRender();
}

function changeAddress(index) {
    document.getElementById("address-" + index).value = document.getElementById("addressselect-" + index).value;
}

function editorNew() {
    editorEdit();
    editorContent.push({address: 0xFFFF, value: 0xFFFF});
    editorRender();
}

function editorRemove(index) {
    editorEdit();
    editorContent.splice(index, 1);
    editorRender();
}

function openFile() {
    document.getElementById("file").click();
}

function openFileCallback() {
    if (document.getElementById("file").files.length < 1) return;
    let file = document.getElementById("file").files[0];
    let reader = new FileReader();
    reader.onload = function() {
        let arrayBuffer = reader.result;
        try {
            editorContent = parseEeprom(new Uint8Array(arrayBuffer));
        } catch (error) {
            alert(error.message);
        }
        editorRender();
    }
    reader.readAsArrayBuffer(file);
    console.log();
}

function downloadBlob(data, fileName, mimeType) {
  var blob, url;
  blob = new Blob([data], {
    type: mimeType
  });
  url = window.URL.createObjectURL(blob);
  downloadURL(url, fileName);
  setTimeout(function() {
    return window.URL.revokeObjectURL(url);
  }, 1000);
};

function downloadURL(data, fileName) {
  var a;
  a = document.createElement('a');
  a.href = data;
  a.download = fileName;
  document.body.appendChild(a);
  a.style = 'display: none';
  a.click();
  a.remove();
};

function saveFile() {
    editorEdit();
    let data = createEeprom(editorContent);
    downloadBlob(data, 'eeprom.bin', 'application/octet-stream');
}

//let instructions = parseEeprom(clusterboard);
//let result = createEeprom(instructions);
//console.log(result);

