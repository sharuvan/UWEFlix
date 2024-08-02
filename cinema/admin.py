from django.contrib import admin
from .models import Film, Screen, Showing, Ticket

admin.site.register(Film)
admin.site.register(Screen)
admin.site.register(Showing)
admin.site.register(Ticket)