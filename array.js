Array.prototype.each = function(block){
  for(var i=0;i<this.length;i++)block(this[i])
}
Array.prototype.each_with_index = function(block){
  for(var i=0;i<this.length;i++)block(this[i],i)
}

