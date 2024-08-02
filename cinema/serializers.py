from rest_framework import serializers
from .models import Film, Screen, Showing, Ticket, Seat

class FilmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Film
        fields = '__all__'

class ScreenSerializer(serializers.ModelSerializer):
    capacity = serializers.ReadOnlyField()

    class Meta:
        model = Screen
        fields = '__all__'

class ShowingSerializer(serializers.ModelSerializer):
    # film_id = serializers.PrimaryKeyRelatedField(queryset=Film.objects.all(), source='film', write_only=True)
    # screen_id = serializers.PrimaryKeyRelatedField(queryset=Screen.objects.all(), source='screen', write_only=True)
    film = FilmSerializer(read_only=True)
    screen = ScreenSerializer(read_only=True)

    class Meta:
        model = Showing
        fields = [
            'id', 'film', 'screen', 'show_time', 'ticket_price', 'discount',
        ]

    def create(self, validated_data):
        film = validated_data.pop('film')
        screen = validated_data.pop('screen')
        showing = Showing.objects.create(film=film, screen=screen, **validated_data)
        return showing

    def update(self, instance, validated_data):
        film = validated_data.pop('film')
        screen = validated_data.pop('screen')
        instance.film = film
        instance.screen = screen
        instance.show_time = validated_data.get('show_time', instance.show_time)
        instance.ticket_price = validated_data.get('ticket_price', instance.ticket_price)
        instance.discount = validated_data.get('discount', instance.discount)
        instance.save()
        return instance

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = '__all__'

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = '__all__'