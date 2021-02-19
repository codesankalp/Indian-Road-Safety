from django.contrib import admin
from .models import Roads
# Register your models here.

# admin.site.register(Roads)


class RoadAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {
            'fields': ('original_image', 'detected_image', 'longitude', 'latitude', 'effect_percentage', 'boxes', 'scores', 'classes', 'num')
        }),
    )


admin.site.register(Roads, RoadAdmin)
