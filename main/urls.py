# -*- coding: utf-8 -*-

from django.conf.urls import patterns, url
from main.views import *

API_BASE_URL = "api/"

urlpatterns = patterns('main.views',
    url(r'^$', main_page),

    url(r'users/read/', Users.read),
    url(r'users/create/', Users.create),
    url(r'users/update/', Users.update),
    url(r'users/destroy/', Users.destroy),

    url(r'project_tree/read/', ProjectTree.read),
    url(r'project_tree/direction/create', ProjectTree.Direction.create),
    url(r'project_tree/direction/update', ProjectTree.Direction.update),
    url(r'project_tree/direction/destroy', ProjectTree.Direction.destroy),

    url(r'project_tree/project/get_description', ProjectTree.Project.get_description),
    url(r'project_tree/project/create', ProjectTree.Project.create),
    url(r'project_tree/project/update', ProjectTree.Project.update),
    url(r'project_tree/project/destroy', ProjectTree.Project.destroy),

    url(r'nii/add_project', Nii.add_project),
    url(r'nii/remove_project', Nii.remove_project),
    url(r'nii/read', Nii.read),
    url(r'nii/create', Nii.create),
    url(r'nii/update', Nii.update),
    url(r'nii/get_project', Nii.get_project),

    url(r'university/read', University.read),

    url(r'employee/read', Employee.read),

    url(r'post/read', Post.read)

)