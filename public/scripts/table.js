/* <div id="monsterTableGraph" class="barChart">
    <table>
        <caption onclick="toggleTable(this)">Chance of at least x</caption>
        <tbody>
            <tr class="bars">
                <td><p style="height: 90%;">9</p></td>
                <td><p style="height: 50%;">5</p></td>
                <td><p style="height: 30%;">3</p></td>
            </tr>
            <tr class="values">
                <th>1</th>
                <th>2</th>
                <th>3</th>
            </tr>
        </tbody>
    </table>
</div> */

let invalidIdChars = /[\s()]/g;

function barChartHtml(chartid){
    if((invalidIdChars).test(chartid)) throw "bar chart id cannot contain spaces";
    let elem = document.createElement('div');
    elem.className = "barChart";
    elem.id = chartid;
    elem.innerHTML = 
        `<table>
            <caption onclick="toggleTable(this)">${chartid.replaceAll('_', ' ')}</caption>
            <tbody>
                <tr class="bars"></tr>
                <tr class="values"></tr>
            </tbody>
        </table>`;
    return elem; 
}

//objArr in the form of [{x1:y1, x2:y2},{x1:y1, x3:y3}]
function loadTableGraphic(tableId, objArr, toShow=true) {
    tableId = tableId.replaceAll(invalidIdChars,'_');
    let table = document.querySelector('#'+tableId);
    if(!table){
        table = barChartHtml(tableId);
        if(!toShow) table.querySelector('tbody').style.display='none';
        document.body.appendChild(table);
    }

    let headers = '';
    let data = '';
    let keys = new Set();
    objArr.forEach(e=>{Object.keys(e).forEach(k=>{keys.add(k)})});
    keys.forEach(k=>{
        headers += '<th>' + k + '</th>';
        data += '<td>';
        let brightness = 100;
        objArr.forEach(e => {
            if(e[k]!= undefined) data += '<p style="filter:brightness('+ brightness +'%); height:' + e[k] + '%;">' + e[k].toFixed(0) + '</p>';
            brightness *= 0.8;
        });
        //data += '<p style="height:' + keyObj[v] + '%;">' + keyObj[v].toFixed(0) + '</p>'
        data += '</td>';
    });
    table.querySelector('.bars').innerHTML = data;
    table.querySelector('.values').innerHTML = headers;
}

/* <div>
<table id="monsterTableList" class="dataTable">
    <caption onclick="toggleTable(this)" style="white-space: nowrap;">Chance of y Damage or Less given x Defence</caption>
    <tbody>
        <tr><th>axis labels</th> <th>x1 label</th> <th>x2 label</th> <th>x3 label</th></tr>
        <tr><th> y1 label </th> <td>y1x1</td> <td>y1x2</td></tr>
        <tr><th> y2 label </th> <td>y2x1</td> <td>y2x2</td></tr>
    </tbody>
</table>
</div> */

function tableHtml(chartid){
    if((/\s/).test(chartid)) throw "bar chart id cannot contain spaces";
    let elem = document.createElement('table');
    elem.className = "dataTable";
    elem.id = chartid;
    elem.innerHTML = 
        `<caption onclick="toggleTable(this)">${chartid.replaceAll('_', ' ')}</caption>
        <tbody></tbody>`;
    return elem;
}

function loadTableList(tableId, objArr, colHeader, toShow=true) {
    tableId = tableId.replaceAll(invalidIdChars,'_');
    let table = document.querySelector('#'+tableId);
    if(!table){
        table = tableHtml(tableId);
        if(!toShow) table.querySelector('tbody').style.display='none';
        document.body.appendChild(table);
    }

    let keys = new Set();
    objArr.forEach(e=>{Object.keys(e).forEach(k=>{
        let n = Number(k);
        if(Number.isNaN(n)){keys.add(k);}else{keys.add(n);}
    })});

    let keysSorted = Array.from(keys).sort((a,b)=>a-b);

    let tableData = '';

    if(colHeader!=undefined){
            colHeader.forEach(h=>{
            tableData += '<th>';
            tableData += h;
            tableData += '</th>';
        });
    }

    keysSorted.forEach(k=>{
        tableData += '<tr>'
        tableData += '<th>' + k + '</th>';
        objArr.forEach(e => {
            tableData += '<td align="right">';
            if(e[k]!= undefined) tableData += e[k].toFixed(2);
            tableData += '</td>';
        });
        tableData += '</tr>';
    });

    table.querySelector('tbody').innerHTML = tableData;
}

function toggleTable(e){
    let tbody = e.parentElement.querySelector('tbody');
    if(tbody.checkVisibility()){
        tbody.style.display='none';
    } else {
        tbody.style.display='';
    }
}