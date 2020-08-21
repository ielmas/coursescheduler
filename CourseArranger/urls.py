from django.contrib import admin
from django.urls import include, path
from web import views
urlpatterns = [
    path('', views.index),
    path('api/getPlan', views.calculatePossiblePlans),
    path('api/<str:department>/<str:course_code>', views.getSections),
    path('api/departments', views.getDepartments),
    path('api/<str:department>', views.getDepartmentCourses),
    path('admin/', admin.site.urls),
]