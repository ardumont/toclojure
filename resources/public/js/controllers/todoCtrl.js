/*global todomvc, angular */
'use strict';

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
todomvc.controller('TodoCtrl', function TodoCtrl($scope, $location, todoResource, filterFilter) {
    $scope.todos = todoResource.getTodos(function(){
	    $scope.newTodo = '';
    	$scope.editedTodo = null;

    	$scope.$watch('todos', function (newValue, oldValue) {
    		$scope.remainingCount = filterFilter($scope.todos, { completed: false }).length;
    		$scope.completedCount = $scope.todos.length - $scope.remainingCount;
    		$scope.allChecked = !$scope.remainingCount;
    		if (newValue !== oldValue) { // This prevents unneeded calls to the local storage
    			var todosWithIds = todoResource.updateTodos(newValue, function(){
    			    $scope.todos = todosWithIds;
    			});
    		}
    	}, true);

    	if ($location.path() === '') {
    		$location.path('/');
    	}

    	$scope.location = $location;

	});

	$scope.$watch('location.path()', function (path) {
		$scope.statusFilter = (path === '/active') ?
			{ completed: false } : (path === '/completed') ?
			{ completed: true } : null;
	});

	$scope.addTodo = function () {
		var newTodo = $scope.newTodo.trim();
		if (!newTodo.length) {
			return;
		}

		$scope.todos.push({
			title: newTodo,
			completed: false
		});

		$scope.newTodo = '';
	};

	$scope.editTodo = function (todo) {
		$scope.editedTodo = todo;
		// Clone the original todo to restore it on demand.
		$scope.originalTodo = angular.extend({}, todo);
	};

	$scope.doneEditing = function (todo) {
		$scope.editedTodo = null;
		todo.title = todo.title.trim();

		if (!todo.title) {
			$scope.removeTodo(todo);
		}
	};

	$scope.revertEditing = function (todo) {
		$scope.todos[todos.indexOf(todo)] = $scope.originalTodo;
		$scope.doneEditing($scope.originalTodo);
	};

	$scope.removeTodo = function (todo) {
	    todoResource.deleteTodo({todoId:todo._id});
		$scope.todos.splice($scope.todos.indexOf(todo), 1);
	};

	$scope.clearCompletedTodos = function () {
		$scope.todos = $scope.todos.filter(function (val) {
		    if(val.completed){
		        todoResource.deleteTodo({todoId:val._id});
		    }
			return !val.completed;
		});
	};

	$scope.markAll = function (completed) {
		$scope.todos.forEach(function (todo) {
			todo.completed = completed;
		});
	};
});
