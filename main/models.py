from django.db import models


class University(models.Model):
    name = models.CharField(max_length=250, null=True)


class Directions(models.Model):
    name = models.CharField(max_length=250, null=True)


class Projects(models.Model):
    name = models.CharField(max_length=250, null=True)
    description = models.TextField()
    direction = models.ForeignKey(Directions)


class Nii(models.Model):
    name = models.CharField(max_length=250, null=True)
    university = models.ForeignKey(University)
    projects = models.ManyToManyField(Projects, null=True)


class Posts(models.Model):
    name = models.CharField(max_length=200, null=True)


class Employees(models.Model):
    name = models.CharField(max_length=45, null=False)
    surname = models.CharField(max_length=45, null=True)
    patronymic = models.CharField(max_length=50, null=True)
    tel = models.CharField(max_length=100, null=True)
    mail = models.CharField(max_length=50, null=True)
    post = models.ForeignKey(Posts, null=True)
    nii = models.ForeignKey(Nii)
