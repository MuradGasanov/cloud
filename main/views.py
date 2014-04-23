# -*- coding: utf-8 -*-

from django.shortcuts import render_to_response, HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseForbidden
from django.contrib.auth import models as auth_models
import main.models as models
from datetime import *
import json


def main_page(request):
    """
    возвращает страницу редактирования пользователей, если обычный пользователь, иначе главную страницу
    """

    if request.user.is_superuser:
        return render_to_response("users.html")
    else:
        return render_to_response("main.html")


def log_in(request):
    """
    вход в профиль
    """

    try:
        data = json.loads(request.body)
    except (TypeError, ValueError):
        return HttpResponseForbidden()

    username = data.get("login", "")
    password = data.get("password", "")

    user = authenticate(username=username, password=password)

    if user:
        login(request, user)
        request.session.set_expiry(timedelta(days=1).seconds)
        if user.is_active:
            return HttpResponse(json.dumps({"error": []}), content_type="application/json")
        else:
            return HttpResponse(json.dumps({"error": ["Пользователь заблокирован"]}), content_type="application/json")
    else:
        return HttpResponse(json.dumps({"error": ["Неверный логин и пароль"]}), content_type="application/json")


def log_out(request):
    """
    выходит из профиля
    """
    logout(request)
    return HttpResponseRedirect("/")

#---------------------------------------------------------------------------------
# Users
#---------------------------------------------------------------------------------


class Users():
    def __init__(self):
        pass

    @staticmethod
    def read(r):
        items = list(
            auth_models.User.objects
            .values("id", "username", "first_name", "email", "is_superuser", "is_active")
        )
        js = json.dumps(items)
        return HttpResponse(js, content_type="application/json")

    @staticmethod
    def create(r):
        """
        добавление
        """
        item = json.loads(r.POST.get("item"))
        items = auth_models.User.objects.filter(is_active=True)
        new_user, created = items.get_or_create(
            username=item.get("username")
        )
        if created:
            new_user.first_name = item.get("first_name")
            new_user.email = item.get("email")
            new_user.is_stuff = False
            new_user.is_superuser = False  # item.get("is_superuser")
            new_user.set_password(item.get("password"))
            new_user.save()
        else:
            return HttpResponseForbidden()

        return HttpResponse(json.dumps({"id": new_user.id,
                                        "first_name": new_user.first_name,
                                        "username": new_user.username,
                                        "email": new_user.email,
                                        "is_superuser": new_user.is_superuser, }),
                            content_type="application/json")

    @staticmethod
    def destroy(r):
        """
        удаление
        """
        item = json.loads(r.POST.get("item"))
        user = auth_models.User.objects.get(id=int(item.get("id")))
        if user:
            if user.username == "admin":
                return HttpResponseForbidden()
            user.is_active = False
            user.username += "_deleted"
            user.save()
        else:
            return HttpResponseForbidden()
        return HttpResponse(json.dumps({}), content_type="application/json")

    @staticmethod
    def update(r):
        """
        редактирование
        """
        item = json.loads(r.POST.get("item"))
        user = auth_models.User.objects.get(id=int(item.get("id")))
        if not user:
            return HttpResponseForbidden()
        user.first_name = item.get("first_name")
        user.email = item.get("email")
        password = item.get("password")
        if password:
            user.set_password(password)
        user.save()

        return HttpResponse(json.dumps({"id": user.id,
                                        "first_name": user.first_name,
                                        "username": user.username,
                                        "email": user.email,
                                        "is_superuser": user.is_superuser, }),
                            content_type="application/json")

#---------------------------------------------------------------------------------
# ProjectTree
#---------------------------------------------------------------------------------


class ProjectTree():
    def __init__(self):
        pass

    @staticmethod
    def read(request):
        """
        вывод дерева
        """
        directions = models.Directions.objects.all()
        tree = [
            {
                "id": 0,
                "name": "Добавить направление",
                "type": "add_direction",
                "has_items": False,
                "items": []
            }
        ]
        for d in directions:
            projects = d.projects_set.all()
            node = {
                "id": d.id,
                "name": d.name,
                "type": "direction",
                "has_items": True,
                "items": [
                    {
                        "id": 0,
                        "name": "Добавить проект",
                        "type": "add_project",
                        "has_items": False,
                        "items": []
                    }
                ]
            }
            for p in projects:
                nii = p.nii_set.all()
                node["items"].append({
                    "id": p.id,
                    "name": p.name,
                    "type": "project",
                    "has_items": True,
                    "items":  [
                        {
                            "id": 0,
                            "name": "Добавить НИИ",
                            "type": "add_nii",
                            "has_items": False,
                            "items": []
                        }
                    ]
                })
                for n in nii:
                    node["items"][-1]["items"].append({
                        "id": n.id,
                        "name": n.name,
                        "type": "nii",
                        "has_items": False,
                        "items": []
                    })
            tree.append(node)
        return HttpResponse(json.dumps(tree),
                            content_type="application/json")

    class Direction():
        def __init__(self):
            pass

        @staticmethod
        def create(request):
            item = json.loads(request.POST.get("item"))
            new_direction = models.Directions.objects.create(
                name=item.get("name")
            )
            return HttpResponse(json.dumps({"id": new_direction.id,
                                            "name": new_direction.name}),
                                content_type="application/json")

        @staticmethod
        def update(request):
            item = json.loads(request.POST.get("item"))
            direction = models.Directions.objects.get(
                id=int(item.get("id"))
            )
            direction.name = item.get("name")
            direction.save()
            return HttpResponse(json.dumps({"id": direction.id,
                                            "name": direction.name}),
                                content_type="application/json")

        @staticmethod
        def destroy(r):
            """
            удаление
            """
            item = json.loads(r.POST.get("item"))
            models.Directions.objects.get(id=int(item.get("id"))).delete()
            return HttpResponse(json.dumps({}), content_type="application/json")

    class Project():
        def __init__(self):
            pass

        @staticmethod
        def get_description(request):
            item = json.loads(request.POST.get("item"))
            project = models.Projects.objects.get(id=int(item.get("id")))
            return HttpResponse(json.dumps({"description": project.description,
                                            "direction": project.direction.id}),
                                content_type="application/json")

        @staticmethod
        def create(request):
            item = json.loads(request.POST.get("item"))
            new_project = models.Projects.objects.create(
                name=item.get("name"),
                description=item.get("description"),
                direction=models.Directions.objects.get(id=int(item.get("direction")))
            )
            return HttpResponse(json.dumps({"id": new_project.id,
                                            "name": new_project.name,
                                            "description": new_project.description,
                                            "direction": new_project.direction.id}),
                                content_type="application/json")

        @staticmethod
        def update(request):
            item = json.loads(request.POST.get("item"))
            project = models.Projects.objects.get(
                id=int(item.get("id"))
            )
            project.name = item.get("name")
            project.description = item.get("description")
            project.save()
            return HttpResponse(json.dumps({"id": project.id,
                                            "name": project.name,
                                            "description": project.description,
                                            "direction": project.direction.id}),
                                content_type="application/json")

        @staticmethod
        def destroy(request):
            """
            удаление
            """
            item = json.loads(request.POST.get("item"))
            models.Projects.objects.get(id=int(item.get("id"))).delete()
            return HttpResponse(json.dumps({}), content_type="application/json")


class Nii():
    def __init__(self):
        pass

    @staticmethod
    def read(request):
        if "item" in request.POST:
            item = json.loads(request.POST.get("item"))
            exclude_list = models.Projects.objects.get(
                id=int(item.get("project_id"))
            ).nii_set.all().values_list("id", flat=True)
            nii = list(
                models.Nii.objects.exclude(id__in=exclude_list).values("id", "name")
            )
            return HttpResponse(json.dumps({"nii_list": nii}),
                                content_type="application/json")
        else:
            nii = models.Nii.objects.all()
            nii_list = []
            for n in nii:
                nii_list.append({
                    "id": n.id,
                    "name": n.name,
                    "university": n.university_id,
                    "university_name": n.university.name if n.university else ""
                })
            return HttpResponse(json.dumps(nii_list),
                                content_type="application/json")

    @staticmethod
    def add_project(request):
        item = json.loads(request.POST.get("item"))
        nii = models.Nii.objects.get(id=int(item.get("id")))
        nii.projects.add(int(item.get("project_id")))
        # nii.save()
        return HttpResponse(json.dumps({"id": nii.id,
                                        "name": nii.name}),
                            content_type="application/json")

    @staticmethod
    def remove_project(request):
        item = json.loads(request.POST.get("item"))
        nii = models.Nii.objects.get(id=int(item.get("id")))
        project = models.Projects.objects.get(id=int(item.get("project_id")))
        nii.projects.remove(project)
        return HttpResponse(json.dumps({}),
                            content_type="application/json")

    @staticmethod
    def create(request):
        item = json.loads(request.POST.get("item"))

        university = University.get_or_create(item.get("university"))

        new_nii = models.Nii.objects.create(
            name=item.get("name"),
            university=university
        )

        return HttpResponse(json.dumps({"id": new_nii.id,
                                        "name": new_nii.name,
                                        "university": new_nii.university_id}),
                            content_type="application/json")

    @staticmethod
    def update(request):
        item = json.loads(request.POST.get("item"))

        university = University.get_or_create(item.get("university"))

        nii = models.Nii.objects.get(id=int(item.get("id")))

        nii.name = item.get("name")
        nii.university = university
        nii.save()

        return HttpResponse(json.dumps({"id": nii.id,
                                        "name": nii.name,
                                        "university": nii.university_id}),
                            content_type="application/json")

    @staticmethod
    def destroy(request):
        item = json.loads(request.POST.get("item"))

        models.Nii.objects.get(id=int(item.get("id"))).delete()

        return HttpResponse(json.dumps("ok"),
                            content_type="application/json")

    @staticmethod
    def get_project(request):
        item = json.loads(request.POST.get("item"))
        nii_id = item.get("id")
        if nii_id:
            projects = list(models.Nii.objects.get(id=nii_id).projects.all().values("id", "name", "description"))
            return HttpResponse(json.dumps(projects),
                                content_type="application/json")
        return HttpResponseForbidden()


class University():
    def __init__(self):
        pass

    @staticmethod
    def read(request):
        university = list(
            models.University.objects.all().values("id", "name")
        )
        return HttpResponse(json.dumps(university),
                            content_type="application/json")

    @staticmethod
    def get_or_create(id_or_name):
        if type(id_or_name) == int:
            university = models.University.objects.get(id=id_or_name)
        elif type(id_or_name) == unicode and len(id_or_name) != 0:
            university = models.University.objects.create(name=id_or_name)
        else:
            university = None
        return university


class Employee():
    def __init__(self):
        pass

    @staticmethod
    def read(request):
        item = json.loads(request.POST.get("item"))
        nii_id = item.get("id")
        if nii_id:
            employees = list(models.Employees.objects.filter(nii_id=nii_id).values(
                "id", "name", "surname", "patronymic",
                "tel", "mail",
                "post__id", "post__name",
                "nii__id", "nii__name"
            ))
            return HttpResponse(json.dumps(employees),
                                content_type="application/json")
        return HttpResponseForbidden()

    @staticmethod
    def create(request):
        item = json.loads(request.POST.get("item"))

        nii = models.Nii.objects.get(id=item.get("nii_id"))
        post = Post.get_or_create(item.get("post"))

        new_employee = models.Employees.objects.create(
            name=item.get("name"),
            surname=item.get("surname"),
            patronymic=item.get("patronymic"),
            mail=item.get("mail"),
            tel=item.get("tel"),
            post=post,
            nii=nii
        )

        return HttpResponse(json.dumps({"id": new_employee.id,
                                        "name": new_employee.name,
                                        "surname": new_employee.surname,
                                        "patronymic": new_employee.patronymic,
                                        "tel": new_employee.tel,
                                        "mail": new_employee.mail,
                                        "post__id": new_employee.post.id if new_employee.post else None,
                                        "post__name": new_employee.post.name if new_employee.post else None,
                                        "nii__id": new_employee.nii.id,
                                        "nii__name": new_employee.nii.name
                                        }),
                            content_type="application/json")

    @staticmethod
    def update(request):
        item = json.loads(request.POST.get("item"))

        nii = models.Nii.objects.get(id=item.get("nii_id"))
        post = Post.get_or_create(item.get("post"))

        employee = models.Employees.objects.get(id=int(item.get("id", 0)))
        employee.name = item.get("name")
        employee.surname = item.get("surname")
        employee.patronymic = item.get("patronymic")
        employee.mail = item.get("mail")
        employee.tel = item.get("tel")
        employee.post = post
        employee.nii = nii
        employee.save()

        return HttpResponse(json.dumps({"id": employee.id,
                                        "name": employee.name,
                                        "surname": employee.surname,
                                        "patronymic": employee.patronymic,
                                        "tel": employee.tel,
                                        "mail": employee.mail,
                                        "post__id": employee.post.id if employee.post else None,
                                        "post__name": employee.post.name if employee.post else None,
                                        "nii__id": employee.nii.id,
                                        "nii__name": employee.nii.name
                                        }),
                            content_type="application/json")

    @staticmethod
    def destroy(request):
        item = json.loads(request.POST.get("item"))

        models.Employees.objects.get(id=item.get("id")).delete()

        return HttpResponse(json.dumps("ok"),
                            content_type="application/json")


class Post():
    def __init__(self):
        pass

    @staticmethod
    def read(request):

        post = list(models.Posts.objects.all().values("id", "name"))

        return HttpResponse(json.dumps(post),
                            content_type="application/json")

    @staticmethod
    def get_or_create(post):
        if type(post) == int:
            post = models.Posts.objects.get(id=post)
        elif type(post) == unicode and len(post) != 0:
            post = models.Posts.objects.create(name=post)
        else:
            post = None
        return post
