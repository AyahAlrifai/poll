var PollController =(function() {
  var question=function(questionHead,choices,id) {
    this.questionHead=questionHead;
    this.choices=choices;
    this.id=id;
    this.vote=0;
  }

  var choice=function(choiceHead,id) {
    this.choiceHead=choiceHead;
    this.id=id;
    this.vote=0;
  }

  var data={
    questions:[]
  }

  return {
    addQuestion:function(q,c) {
      var id,choices=[];
      if(c.length>=2) {
        if(data.questions.length==0) {
          id=0;
        } else {
          id=data.questions[data.questions.length-1].id+1;
        }
        for(var i=0;i<c.length;i++) {
          choices[i]=new choice(c[i],i);
        }
        var quest=new question(q,choices,id);
        data.questions.push(quest);
        return quest;
      }
      return -1;
    },

    vote:function(cID,qID) {
      data.questions[parseInt(qID)].vote++;
      data.questions[parseInt(qID)].choices[parseInt(cID)].vote++;
      return data.questions[parseInt(qID)];
    }

    ,initQuestion:function() {
      var choices=[new choice("<10",0),new choice("11-18",1),new choice("19-30",2),new choice("31-50",3),new choice(">50",4)];
      choices[0].vote=6;
      choices[1].vote=8;
      choices[2].vote=56;
      choices[3].vote=42;
      choices[4].vote=26;
      data.questions.push(new question("how old are you?",choices,0));
      data.questions[0].vote=6+8+56+42+26;
      return data.questions[0];
    }
  };
})();

var UIController=(function() {
  var data={
    count:0
  }

  var DOMstrings = {
    questionValue:"poll-question",
    newChoice:"poll-choices",
    questionBtn:"add-question",
    questionChoices:"inserted-choice",
    choiceBtn:"add-choices",
    posts:"posts"
  };

  var getChoices=function() {
    var choices,values=[];
    choices=document.getElementById(DOMstrings.questionChoices).querySelectorAll(".value");
    for(var i=0;i<choices.length;i++) {
      values[i]=choices[i].innerHTML;
    }
    return values;
  };

  var updateChoiceTextBox=function() {
    document.getElementById(DOMstrings.newChoice).value="";
  }

  var deleteChoice=function(event) {
   var parent=event.target.parentNode.parentNode;
   parent.parentNode.removeChild(parent)
  }

  return {
    getDOMstrings: function() {
        return DOMstrings;
    },

    addChoice:function() {
      var value,choicesBlock,deleteBtn;
      value=document.getElementById(DOMstrings.newChoice).value;
      if(value!=="") {
        choicesBlock=document.getElementById(DOMstrings.questionChoices);
        str='<li class="list-group-item d-flex justify-content-between align-items-center list-group-item-action currentChoices"><p style="display:inline" class="value">'+value+'<p><i id="cc-'+data.count+'" class="col-sm-right fas fa-trash delete-choice" ></i></li>';
        choicesBlock.insertAdjacentHTML( 'beforeend', str );
        deleteBtn=document.getElementById("cc-"+(data.count++));
        deleteBtn.addEventListener("click",deleteChoice);
        updateChoiceTextBox();
        return 1;
      }
      return -1;
    },

    getQuestion:function() {
      data.count=0;
      var q,c;
      q=document.getElementById(DOMstrings.questionValue).value;
      c=getChoices();
      if(q!=="") {
        return {
          question:q,
          choices:c
        }
      } else {
        return -1;
      }

    },

    updateQuestion:function() {
      document.getElementById(DOMstrings.questionValue).value="";
      document.getElementById(DOMstrings.questionChoices).innerHTML="";
    },

    showQuestion:function(question) {
      var str,choices,vote,id;
      str='<div class="post" id="'+question.id+'"><div class="question">'+question.questionHead+'</div><hr>';
      choices=question.choices;
      for(var i=0;i<choices.length;i++) {
        str+='<div class="row"><div class="col-xl-1"></div><div class="col-xl-9"><div class="progress progress2 ">';
          if(question.vote==0) {
            vote=0;
          } else {
            vote=Math.round(choices[i].vote/question.vote*100);
          }
          //onclick="PollController.vote('+choices[i].id+','+question.id+')"
          str+='<div id="v-'+question.id+'-'+choices[i].id+'" class="progress-bar bg-info progress-bar-striped" style="width:'+vote+'%;color:#000000">'+choices[i].choiceHead +"....votes:"+choices[i].vote+'</div></div></div><div class="col-xl-1"><i  class="col-sm-right fas fa-vote-yea vote-choice" id="'+question.id+'-'+choices[i].id+'"></i></div><div class="col-xl-1"></div></div>';
      }
      str+='</div>';
      document.getElementById(DOMstrings.posts).insertAdjacentHTML('afterbegin', str );

    },

    updateVote:function(q) {
      var question;
      for(var i=0;i<q.choices.length;i++) {
        document.getElementById("v-"+q.id+"-"+q.choices[i].id).setAttribute("style","color:#000000;width:"+Math.round((q.choices[i].vote/q.vote)*100)+"%");
        document.getElementById("v-"+q.id+"-"+q.choices[i].id).innerHTML=q.choices[i].choiceHead+"----votes:"+q.choices[i].vote;
      }
    }
  }
})();

var Controller=(function(PollCtrl,UICtrl) {

  var setupEventListeners=function() {
    var addQustionBtn,addChoiceBtn;
    addQustionBtn=document.getElementById(UICtrl.getDOMstrings().questionBtn);
    addQustionBtn.addEventListener("click",addQuestion);
    addChoiceBtn=document.getElementById(UICtrl.getDOMstrings().choiceBtn);
    addChoiceBtn.addEventListener("click",addChoice);
    window.addEventListener("click",addVote);
  }

  var addVote=function(event) {
    if(event.target.getAttribute("class").split(" ")[3]==="vote-choice") {
      var id,newQuestion;
      id=event.target.getAttribute("id").split("-");
      newQuestion=PollCtrl.vote(id[1],id[0]);
      UICtrl.updateVote(newQuestion);
    }
  }
  var warning=function(str) {
    document.getElementById('poll').insertAdjacentHTML('beforebegin', ' <div class="alert alert-warning alert-dismissible fade show"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>Warning!</strong>'+str+'</div>');
  }
  var addQuestion=function() {
    var question=UICtrl.getQuestion();
    if(question!==-1) {
      var q=PollCtrl.addQuestion(question.question,question.choices);
      if(q!=-1) {
        UICtrl.showQuestion(q);
        UICtrl.updateQuestion();
      }
      else {
        warning("You should insert two or more choices");
      }
    } else {
        warning("can not insert empty question");
    }
  }

  var addChoice=function() {
    var x=UICtrl.addChoice();
    if(x===-1) {
      warning("can not insert empty choice");
    }
  }

  return {
    init:function() {
      setupEventListeners();
      UICtrl.showQuestion(PollCtrl.initQuestion());
    }
  }

})(PollController,UIController);

window.addEventListener("load",Controller.init);
