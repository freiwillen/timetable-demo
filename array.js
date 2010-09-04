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