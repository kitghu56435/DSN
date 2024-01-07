function setData_block(block,int){
    let data_block = document.getElementsByClassName('data_block')[block];
    let p = data_block.getElementsByTagName('p')[0];
    p.innerHTML = String(int);    
}