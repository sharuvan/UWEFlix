from django.db import models

class Film(models.Model):
    title = models.CharField(max_length=200)
    age_rating = models.CharField(max_length=10)
    duration = models.IntegerField()
    trailer_description = models.TextField()
    poster_image = models.ImageField(upload_to='posters/', null=True)

    def __str__(self):
        return self.title

class Screen(models.Model):
    number = models.CharField(max_length=5)
    is_social_distancing_on = models.BooleanField(default=False)
    seat_rows = models.IntegerField()
    seat_columns = models.IntegerField()

    @property
    def capacity(self):
        total = self.seat_rows * self.seat_columns
        if self.is_social_distancing_on:
            return total / 2
        else:
            return total

class Showing(models.Model):
    film = models.ForeignKey(Film, on_delete=models.CASCADE)
    screen = models.ForeignKey(Screen, on_delete=models.CASCADE)
    show_time = models.DateTimeField()
    tickets_sold = models.IntegerField(default=0)
    ticket_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)

class Ticket(models.Model):
    TICKET_TYPE_CHOICES = (
        ('student', 'Student'),
        ('child', 'Child'),
        ('adult', 'Adult'),
    )
    showing = models.ForeignKey(Showing, on_delete=models.CASCADE)
    user = models.ForeignKey('accounts.User', null=True, blank=True, on_delete=models.CASCADE)
    ticket_type = models.CharField(max_length=255, choices=TICKET_TYPE_CHOICES)
    quantity = models.IntegerField()
    purchase_date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.showing.tickets_sold += self.quantity
        self.showing.save()
        super(Ticket, self).save(*args, **kwargs)

    def __str__(self):
        return f"Ticket for {self.showing.film.title} at {self.showing.show_time}"

class Seat(models.Model):
    row = models.IntegerField()
    column = models.IntegerField()
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"Seat {self.row}-{self.column} for {self.ticket.showing.film.title if self.ticket else 'Available'}"