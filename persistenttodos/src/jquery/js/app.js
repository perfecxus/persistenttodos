<!-- one.upload http://slicnet.com/info/info/apps/textsync/files/appjs -->
/*global jQuery, Handlebars */jQuery(function($) {
	'use strict';
	var Utils = {
		uuid : function() { /* jshint bitwise:false */
			var i, random;
			var uuid = '';
			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
						.toString(16);
			}
			return uuid;
		},
		pluralize : function(count, word) {
			return count === 1 ? word : word + 's';
		},
		store : function(namespace, data) {
			if (arguments.length > 1) {
				return localStorage.setItem(namespace, JSON.stringify(data));
			} else {
				var store = localStorage.getItem(namespace);
				return [];
			}
		}
	};
	var App = {
		init : function() {
			this.ENTER_KEY = 13;
			this.todos = Utils.store('todos-jquery');
			this.cacheElements();
			this.bindEvents();
			this.render();
			this.initAppJangle();
		},
		initAppJangle : function() {
		},
		cacheElements : function() {
			this.todoTemplate = Handlebars.compile($('#todo-template').html());
			this.footerTemplate = Handlebars.compile($('#footer-template')
					.html());
			this.$todoApp = $('#todoapp');
			this.$newTodo = $('#new-todo');
			this.$toggleAll = $('#toggle-all');
			this.$main = $('#main');
			this.$todoList = $('#todo-list');
			this.$footer = this.$todoApp.find('#footer');
			this.$count = $('#todo-count');
			this.$clearBtn = $('#clear-completed');
			this.$loadedUrl = $('#load-url');
			this.$loadBtn = $('#load-btn');
		},
		bindEvents : function() {
			var list = this.$todoList;
			this.$newTodo.on('keyup', this.create);
			this.$toggleAll.on('change', this.toggleAll);
			this.$loadBtn.click(this.onLoad);
			this.$footer.on('click', '#clear-completed', this.destroyCompleted);
			list.on('change', '.toggle', this.toggle);
			list.on('dblclick', 'label', this.edit);
			list.on('keypress', '.edit', this.blurOnEnter);
			list.on('blur', '.edit', this.update);
			list.on('click', '.destroy', this.destroy);
		},
		render : function() {
			this.$todoList.html(this.todoTemplate(this.todos));
			this.$main.toggle(!!this.todos.length);
			this.$toggleAll.prop('checked', !this.activeTodoCount());
			this.renderFooter();
			Utils.store('todos-jquery', this.todos);
		},
		renderFooter : function() {
			var todoCount = this.todos.length;
			var activeTodoCount = this.activeTodoCount();
			var footer = {
				activeTodoCount : activeTodoCount,
				activeTodoWord : Utils.pluralize(activeTodoCount, 'item'),
				completedTodos : todoCount - activeTodoCount
			};
			this.$footer.toggle(!!todoCount);
			this.$footer.html(this.footerTemplate(footer));
		},
		toggleAll : function() {
			var isChecked = $(this).prop('checked');
			$.each(App.todos, function(i, val) {
				val.completed = isChecked;
			});
			var todosAll = toDoList.selectAll(aListId);
			todosAll.get(function(nodelist) {
			for (var count=0;count<nodelist.nodes().length;count++){
				var todoCurrNode = nodelist.nodes()[count];
				var completionFlagNode = todoCurrNode.select(aCompletionFlag);
				completionFlagNode.setValue(isChecked);
				}
			});
			session.commit().get(function(success) {
				alert("All changes committed to server.");
			});
			App.render();
		},
		activeTodoCount : function() {
			var count = 0;
			$.each(this.todos, function(i, val) {
				if (!val.completed) {
					count++;
				}
			});
			return count;
		},
		destroyCompleted : function() {
			var todos = App.todos;
			var l = todos.length;
			while (l--) {
				if (todos[l].completed) {
					var todosAll = toDoList.selectAll(aListId);
					todosAll.get(function(nodelist) {
					for (var count=0;count<nodelist.nodes().length;count++){
						var todoCurrNode = nodelist.nodes()[count];
							if(todoCurrNode.value() == todos[l].id){
								//remove listId link
								todoCurrNode.remove(aListId);
								//remove titlevalue path
								var titleValNode = todoCurrNode.select(aTitleValue);
								titleValNode.remove(aTitleValue);
								todoCurrNode.remove(titleValNode);
								//remove completion flag path
								var completionFlagNode = todoCurrNode.select(aCompletionFlag);
								completionFlagNode.remove(aCompletionFlag);
								todoCurrNode.remove(completionFlagNode);
								
								toDoList.remove(todoCurrNode);
							}
						}
					});	
					todos.splice(l, 1);
					
				}
			}
			session.commit().get(function(success) {
				alert("All changes committed to server.");
			});
			App.render();
		},
		// accepts an element from inside the `.item` div and // returns the
		// corresponding todo in the todos array
		getTodo : function(elem, callback) {
			var id = $(elem).closest('li').data('id');
			$.each(this.todos, function(i, val) {
				if (val.id === id) {
					callback.apply(App, arguments);
					return false;
				}
			});
		},
		create : function(e) {
			var $input = $(this);
			var uid =  Utils.uuid();
			var val = $.trim($input.val());
			if (e.which !== App.ENTER_KEY || !val) {
				return;
			}
			alert("Enter pressed")
			App.todos.push({
				id :  uid,
				title : val,
				completed : false
			});
		
			$input.val('');
			
		var todoNode = toDoList.append(uid);
			todoNode.append(aListId);
			todoNode.append(val).append(aTitleValue);
			todoNode.append(false).append(aCompletionFlag);
			todoNode.get(function(node) {
				alert("created node with uri :" + node.uri());
				console.log("created node with uri :" + node.uri());
				console.log("secret=" + node.secret());
			});
			session.commit().get(function(success) {
				alert("All changes committed to server.");
			});
			
			App.render();
		},

		toggle : function() {
			App.getTodo(this, function(i, val) {
				val.completed = !val.completed;
				
				var todosAll = toDoList.selectAll(aListId);
				todosAll.get(function(nodelist) {
					console.log("nodelist lenght: "+nodelist.size());
					
				for (var count=0;count<nodelist.nodes().length;count++){
					var todoCurrNode = nodelist.nodes()[count];
					console.log("value:"+todoCurrNode.value());
						if(todoCurrNode.value() == val.id){
							var completionFlagNode = todoCurrNode.select(aCompletionFlag);
							completionFlagNode.setValue(val.completed);
						}
					}
				});
				
				session.commit().get(function(success) {
					alert("All changes committed to server.");
				});
			});
			App.render();
		},
		onLoad: function(e){
			App.todos = [];
			App.render();
			console.log("initial  App.todos: " + App.todos);
			var todos = App.todos;
			var urlValue = $('#load-url').val();
			var urlSecret = $('#load-secret').val();
			toDoList = session.node(urlValue,urlSecret); //loading todolist from appjangle
			toDoList.catchExceptions(function(r) {
			    console.log("Exception reported! "+r.exception);
			    alert("Please enter a valid todolist Url and reload");//exception handling if todolist url is incorrect
			});
			
			toDoList.get(function(node) {
			    console.log("Got it!");
			    toDoListSecret = node.secret();
			    $('#showingUrl').href = node.uri();
		 		$('#showingUrl').text("Viewing "+ node.uri());
			   // document.all('statuslabel').innerHTML = "Appjangle URL: "+ urlValue;			    
			});
			toDoList.selectAll(aListId).get(function(nodelist){
				//clearing the current todolist
				

				//loading the todolist retrieved from appjangle to the UI
				for (var count=0;count<nodelist.nodes().length;count++){
					var todoCurrNode = nodelist.nodes()[count];
					var uid= todoCurrNode.value();				
					//
					var titleValNode = todoCurrNode.select(aTitleValue);
					titleValNode.catchExceptions(function(r) {
					    console.log("Exception reported! "+r.exception);
					    alert("Wrong title Value node");//exception handling if todolist url is incorrect
					});
					
			
					
					var completionFlagNode = todoCurrNode.select(aCompletionFlag);
					

					   session.getAll(titleValNode, completionFlagNode, function(titleNode, completionNode) {
						   console.log("Got it!");
						    console.log(String(titleNode.value()));
						    valu = new String(titleNode.value());
						    console.log("value: "+valu);
						    
						    console.log(String(completionNode.value()));
						    var boolobj = completionNode.value();
							completionFlagVal = boolobj.valueOf();
						    
							todos.push({
								id : uid,
								title : valu,
								completed : completionFlagVal
							});
							
							console.log("final total sync App.todos: " + App.todos);
							App.render();
					   });
					
					  
					  }
				console.log("final sync App.todos: " + App.todos);
				
			});
			console.log("final  App.todos: " + App.todos);
			},
		
		edit : function() {
			$(this).closest('li').addClass('editing').find('.edit').focus();
		},

		blurOnEnter : function(e) {
			if (e.which === App.ENTER_KEY) {
				e.target.blur();
			}
		},
		update : function() {
			var val = $.trim($(this).removeClass('editing').val());
			App.getTodo(this, function(i) {
				var todosId = this.todos[i].id;
				if (val) {
					this.todos[i].title = val;
					
					var todosAll = toDoList.selectAll(aListId);
					todosAll.get(function(nodelist) {
					for (var count=0;count<nodelist.nodes().length;count++){
						var todoCurrNode = nodelist.nodes()[count];
							if(todoCurrNode.value() == todosId){
								var titleValNode = todoCurrNode.select(aTitleValue);
								titleValNode.setValue(val);
							}
						}
					});
				} else {
					this.todos.splice(i, 1);
					
					var todosAll = toDoList.selectAll(aListId);
					todosAll.get(function(nodelist) {
					for (var count=0;count<nodelist.nodes().length;count++){
						var todoCurrNode = nodelist.nodes()[count];
							if(todoCurrNode.value() == todosId){
								//remove listId link
								todoCurrNode.remove(aListId);
								//remove titlevalue path
								var titleValNode = todoCurrNode.select(aTitleValue);
								titleValNode.remove(aTitleValue);
								todoCurrNode.remove(titleValNode);
								//remove completion flag path
								var completionFlagNode = todoCurrNode.select(aCompletionFlag);
								completionFlagNode.remove(aCompletionFlag);
								todoCurrNode.remove(completionFlagNode);
								
								toDoList.remove(todoCurrNode);
							}
						}
					});
				}
				session.commit().get(function(success) {
					alert("All changes committed to server.");
				});
				this.render();
			});
		},
		destroy : function() {
			App.getTodo(this, function(i) {
				var todosId = this.todos[i].id;
				this.todos.splice(i, 1);
				var todosAll = toDoList.selectAll(aListId);
				todosAll.get(function(nodelist) {
				for (var count=0;count<nodelist.nodes().length;count++){
					var todoCurrNode = nodelist.nodes()[count];
						if(todoCurrNode.value() == todosId){
							//remove listId link
							todoCurrNode.remove(aListId);
							//remove titlevalue path
							var titleValNode = todoCurrNode.select(aTitleValue);
							titleValNode.remove(aTitleValue);
							todoCurrNode.remove(titleValNode);
							//remove completion flag path
							var completionFlagNode = todoCurrNode.select(aCompletionFlag);
							completionFlagNode.remove(aCompletionFlag);
							todoCurrNode.remove(completionFlagNode);
							
							toDoList.remove(todoCurrNode);
						}
					}
				});
				session.commit().get(function(success) {
					alert("All changes committed to server.");
				});
				this.render();
			});
		}
	};
	App.init();
});
<!-- one.end --> 
