(function(){
    var app = angular.module('app', ['ngRoute','ngCookies']);

    app.controller('HomeController', function ($tienda, $rootScope){
        $tienda.cargar();
        this.items = $tienda.categoria(['mujer','hombre','niño']);
    });
    app.controller('CategoriaController', function ($tienda, $rootScope, $routeParams, $location){
        this.nombre = $routeParams.id.toLowerCase();
        $tienda.cargar();
        this.items = $tienda.categoria([this.nombre]);
        if(this.items.length === 0){
            $location.path('/'); 
        }

    });

    app.controller('ProductoController', function ($tienda, $rootScope, $scope, $routeParams, $location){   
        var exists = false;
        for(var x in $rootScope.items){
            if($rootScope.items[x].codigo == $routeParams.id){
                this.item = $rootScope.items[x];
                exists = true;
                break;
            }
        }
        if(!exists) $location.path('/'); 
        $tienda.cargar();
        $scope.agregar = function (articulo){
            var item = {};
            item.codigo = articulo.codigo;
            item.cantidad = 1;
            item.precio = articulo.precio;
            $tienda.agregar(item);
        }; 
    });

    app.controller('CheckoutController', function ($tienda, $scope, $rootScope, $location){
        this.items = $rootScope.items;
        $tienda.cargar();
        $scope.eliminar = function(codigo){
            if($tienda.eliminar(codigo)){
               $location.hash('checkout'); 
            }
        }; 

    });

    app.factory('$tienda', ['$rootScope','$cookies','$cookieStore','$location', function ($rootScope, $cookies, $cookieStore, $location){
        $rootScope.items = tienda.producto;
        $rootScope.itemsContent = []; 
        $rootScope.totalPrice = 0;
        $rootScope.totalProducts = 0;  
        return {
            categoria : function(categorias){
                items = []; repetido = false;
                for(var x in categorias){
                    for(var i in $rootScope.items){
                        if( ($rootScope.items[i].categoria.indexOf(categorias[x].toLowerCase()) != -1) ){ 
                            if(items.indexOf($rootScope.items[i]) == -1){
                                items.push($rootScope.items[i]);
                            }
                        }
                    }
                }
                return items;
            },
            cargar  : function(){
                if($cookies.tienda){
                    $rootScope.itemsContent = JSON.parse($cookies.tienda);
                    $rootScope.totalPrice = 0;
                    $rootScope.totalProducts = 0;  
                    for(var i in $rootScope.itemsContent){
                         $rootScope.totalPrice += $rootScope.itemsContent[i].precio * $rootScope.itemsContent[i].cantidad;
                         $rootScope.totalProducts += $rootScope.itemsContent[i].cantidad;
                    }    
                }
            }, 
            guardar : function(datos){
                if(datos){
                    $cookies.tienda = JSON.stringify(datos);
                    this.cargar();
                }
            },
            agregar : function(articulo){
                if(this.checkExists(articulo, $rootScope.itemsContent)){
                    $rootScope.totalPrice += articulo.precio * articulo.cantidad;
                    $rootScope.totalProducts += articulo.cantidad;
                    this.guardar($rootScope.itemsContent);
                    console.log('Item ' + articulo.codigo + ' modificado ');
                }else{
                    $rootScope.totalPrice += articulo.precio * articulo.cantidad;
                    $rootScope.totalProducts += articulo.cantidad;
                    $rootScope.itemsContent.push(articulo);
                    this.guardar($rootScope.itemsContent);
                    console.log('Item ' + articulo.codigo + ' agregado ');
                }
            },
            eliminar : function(codigo){
                for(var a in $rootScope.itemsContent){
                    if($rootScope.itemsContent[a].codigo === codigo){
                        $rootScope.totalPrice -= $rootScope.items[a].precio * a.cantidad;
                        $rootScope.totalProducts -= a.cantidad;
                        $rootScope.itemsContent.splice(a, 1);
                        this.guardar($rootScope.itemsContent);
                        if(isNaN($rootScope.itemsContent))
                           { $rootScope.itemsContent = 0; }
                        if(isNaN($rootScope.totalProducts))
                           { $rootScope.totalProducts = 0; }
                        if(isNaN($rootScope.totalPrice))
                           { $rootScope.totalPrice = 0; }  
                       return true;
                    }
                }
            },
            checkExists : function(articulo, articulos){
                for(var a in articulos){
                    if(articulos[a].codigo === articulo.codigo){
                        articulos[a].cantidad += articulo.cantidad;
                        return true;
                    }
                }
                return false;
            }
        };
    }]);

    app.config(['$routeProvider',
        function($routeProvider, $locationProvider) {
            $routeProvider.
                when('/', {
                    templateUrl: 'views/catalogo.html',
                    controller: 'HomeController as catalogo'
                }).
                when('/categoria/:id', {
                    templateUrl: 'views/categoria.html',
                    controller: 'CategoriaController as categoria'
                }).
                when('/producto/:id', {
                    templateUrl: 'views/producto.html',
                    controller: 'ProductoController as producto'
                }).
                when('/checkout', {
                    templateUrl: 'views/checkout.html',
                    controller: 'CheckoutController as checkout'
                }).
                otherwise({
                    redirectTo: '/'
                });
        }]);
})();