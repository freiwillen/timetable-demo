Array.prototype.each = function(block){
  for(var i=0;i<this.length;i++)block(this[i])
}
Array.prototype.each_with_index = function(block){
  for(var i=0;i<this.length;i++)block(this[i],i)
}
Array.prototype.map = function(block){
  var r = new Array()
  for(var i=0;i<this.length;i++)r.push(block(this[i]))
  return r
}
Array.prototype.find = function(block){
  var r
  for(var i=0;i<this.length;i++){
    if(block(this[i]) == true){
      r = this[i]
      break
    }
  }
  return r
}
Array.prototype.my_reverse = function(){
  var r = new Array();
  for(var i=this.length-1;i>=0;i--){
    r.push(this[i])
  }
  return r
}
Array.prototype.index = function(el){
  for(var i=0;i<this.length;i++){
    if(this[i] == el)return i
  }
}
Array.prototype.rindex = function(el){
  return this.my_reverse().index(el)
}

Array.prototype.first = function(){
  return this[0]
}

Array.prototype.last = function(){
  return this[this.length-1]
}