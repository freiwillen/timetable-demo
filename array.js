(function(){
  var my_array_methods = {
    each: function(block){
      for(var i=0;i<this.length;i++)block(this[i]);
    },
    each_with_index: function(block){
      for(var i=0;i<this.length;i++)block(this[i],i);
    },
    map: function(block){
      var r = new Array();
      for(var i=0;i<this.length;i++)r.push(block(this[i]));
      return r;
    },
    find: function(block){
      var r;
      for(var i=0;i<this.length;i++){
        if(block(this[i]) == true){ r = this[i]; break;}
      }
      return r;
    },
    my_reverse: function(){
      var r = new Array();
      for(var i=this.length-1;i>=0;i--){ r.push(this[i]);}
      return r;
    },
    index: function(el){
      for(var i=0;i<this.length;i++){ if(this[i] == el)return i;}
    },
    rindex: function(el){ return this.my_reverse().index(el);},
    first: function(){ return this[0];},
    last: function(){return this[this.length-1];},
    any: function(){return (this.length > 0);}
  }
  for(var key in my_array_methods){
    Array.prototype[key] = my_array_methods[key];
  }
})()