import { storeUIobj, getStoredUIvalue } from "./storage.mjs";

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

let invalidIdChars = /[\s(),:<>]/g;

/* creates an div with the following structure:
    <table>
        <caption>${chartName}</caption>
        <tbody>
            <tr class="bars"></tr>
            <tr class="values"></tr>
        </tbody>
    </table>;*/
function barChartHtml(chartName, chartId){
    if((invalidIdChars).test(chartId)) throw "bar chart id cannot contain spaces";
    const elem = document.createElement('div');
    elem.className = "barChart";
    elem.id = chartId;

    const table = document.createElement('table');
    const caption = document.createElement('caption');
    caption.innerText = chartName;
    caption.onclick = ()=>{
        toggleTable(elem)
        storeUIobj({[chartId]:elem.querySelector('tbody').checkVisibility()})
    }
    const tbody = document.createElement('tbody');
    const bars = document.createElement('tr');
    bars.classList.add('bars');
    const values = document.createElement('tr');
    values.classList.add('values');
    tbody.appendChild(bars);
    tbody.appendChild(values);
    table.appendChild(caption);
    table.appendChild(tbody);
    elem.appendChild(table);
    return elem; 
}

//objArr in the form of [{x1:y1, x2:y2},{x1:y1, x3:y3}]
export function loadTableGraphic(chartName, objArr) {
    let chartId = chartName.replaceAll(invalidIdChars,'_');
    let table = document.querySelector('#'+chartId);
    if(!table){
        table = barChartHtml(chartName, chartId);
        let toShow = getStoredUIvalue({[chartId]:undefined});
        toShow? showTableBody(table) : hideTableBody(table);
        document.body.appendChild(table);
    }

    let headers = '';
    let data = '';
    const keys = new Set();
    objArr.forEach(e=>{Object.keys(e).forEach(k=>{keys.add(k)})});
    const keysSorted = Array.from(keys).sort((a,b)=>a-b);
    keysSorted.forEach(k=>{
        headers += '<th>' + k + '</th>';
        data += '<td>';
        objArr.forEach((e,i) => {
            if(e[k]!= undefined) data += `<p style="filter:brightness(${100-i*10}%); height:${e[k]}%;">${e[k].toFixed(0)}</p>`;
        });
        //data += '<p style="height:' + keyObj[v] + '%;">' + keyObj[v].toFixed(0) + '</p>'
        data += '</td>';
    });
    table.querySelector('.bars').innerHTML = data;
    table.querySelector('.values').innerHTML = headers;
}

/* Create a div with the following structure:
<div id="monsterTableList" class="dataTable">
<table>
    <caption>Chance of y Damage or Less given x Defence</caption>
    <thead><tr><th>axis labels</th> <th>x1 label</th> <th>x2 label</th> <th>x3 label</th></tr></thead>
    <tbody>
        <tr><th> y1 label </th> <td>y1x1</td> <td>y1x2</td></tr>
        <tr><th> y2 label </th> <td>y2x1</td> <td>y2x2</td></tr>
    </tbody>
</table>
</div> */
function tableHtml(tableName, tableId){
    if((invalidIdChars).test(tableId)) throw "bar chart id cannot contain spaces";
    const elem = document.createElement('div');
    elem.classList.add("dataTable");
    elem.id = tableId;
    elem.appendChild(tabletable(tableName));
    return elem;
}

function tabletable(tableName){
    const table = document.createElement('table');
    const caption = document.createElement('caption');
    caption.innerText = tableName;
    caption.onclick = (e)=>{
        const elem = e.target.parentElement;
        toggleTable(elem);
        storeUIobj({[elem.parentElement.id]:elem.querySelector('tbody').checkVisibility()})
    }
    table.appendChild(caption);
    table.appendChild(document.createElement('thead'));
    table.appendChild(document.createElement('tbody'));
    return table;
}

export function loadTableList(tableName, objArr, colHeader) {
    let tableId = tableName.replaceAll(invalidIdChars,'_');
    let table = document.querySelector(`#${tableId}`);
    if(!table){
        table = tableHtml(tableName, tableId);
        document.body.appendChild(table);
    }
    if(!table.classList.contains('dataTable')) table.classList.add('dataTable');
    if(table.querySelector('table')==null) table.appendChild(tabletable(tableName));
    
    let toShow = getStoredUIvalue({[tableId]:undefined});
    toShow ? showTableBody(table) : hideTableBody(table);//table.querySelector('tbody').style.display='none';

    let keys = new Set();
    objArr.forEach(e=>{Object.keys(e).forEach(k=>{
        let n = Number(k);
        if(Number.isNaN(n)){keys.add(k);}else{keys.add(n);}
    })});

    if(colHeader!=undefined){
        let headerData = ''
        colHeader.forEach(h=>{
            headerData += '<th>';
            headerData += h;
            headerData += '</th>';
        });
        table.querySelector('thead').innerHTML = headerData;
    }

    let keysSorted = Array.from(keys).sort((a,b)=>a-b);
    let tableData = '';
    keysSorted.forEach(k=>{
        tableData += '<tr>'
        tableData += '<th>' + k + '</th>';
        objArr.forEach(e => {
            
            if(e[k]!= undefined) {
                let c = 255-255*e[k]/100;
                tableData += `<td style="color:rgb(255,${c},${c});">`;
                tableData += e[k].toFixed(2);
                tableData += '</td>';
            } else {
                tableData += '<td></td>'
            }
        });
        tableData += '</tr>';
    });

    table.querySelector('tbody').innerHTML = tableData;
}

function toggleTable(e){
    let tbody = e.querySelector('tbody');
    if(tbody.checkVisibility()){ 
        hideTableBody(e);
    } else {showTableBody(e)}
}

function showTableBody(e){
    let tbody = e.querySelector('tbody');
    let thead = e.querySelector('thead');
    let caption = e.querySelector('caption');
    tbody.style.display='';
    if(thead)thead.style.display='';
    caption.classList.add('captionUp');
    caption.classList.remove('captionDown');
}

function hideTableBody(e){
    let tbody = e.querySelector('tbody');
    let thead = e.querySelector('thead');
    let caption = e.querySelector('caption');
    tbody.style.display='none';
    if(thead)thead.style.display='none';
    caption.classList.remove('captionUp');
    caption.classList.add('captionDown');
}

export function showTable(tableName, shouldShow){
    const tableId = tableName.replaceAll(invalidIdChars,'_');
    const table = document.querySelector(`#${tableId}`);
    if(table){
        if(shouldShow)table.classList.remove('hidden');
        else table.classList.add('hidden');
    }
}