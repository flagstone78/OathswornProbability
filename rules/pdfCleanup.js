//1. rename page id from hex numbers to decimal
//2. extract the png from url, download, then replace url with png name
//3. find index page and replace numbers with links to page
// maybe remove empty spans

function convertLine(book ='s', line){
    let encounterLink = (book=='e')? '':'/EncounterRules.html';
    let storyLink = (book=='s')? '':'/StoryRules.html';
    s=line.split(/(?=[se]<\/div>)/);
    let withLinks = s.map(v=>{
        switch(v[0]){
            case 's':
                return v.replaceAll(/(?<=(,|-|>|>\.|p\.| ))([0-9]+)(?=[-<, )"])/g,  (pageNum)=>`<a href="${storyLink}#pf${pageNum}">${pageNum}</a>`)
                break;
            case 'e':
                return v.replaceAll(/(?<=(,|-|>|>\.|p\.| ))([0-9]+)(?=[-<, )"])/g,  (pageNum)=>`<a href="${encounterLink}#pf${pageNum}">${pageNum}</a>`)
                break;
        }
        return(v);
    })

    return withLinks.join('');
}



