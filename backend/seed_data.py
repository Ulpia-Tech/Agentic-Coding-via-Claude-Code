import sqlite3
import os
import random
import datetime
from dateutil.relativedelta import relativedelta

# Connect to the database
DATABASE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'expenses.db')
conn = sqlite3.connect(DATABASE_PATH)
cursor = conn.cursor()

# Clear existing data
print("Clearing existing data...")
cursor.execute("DELETE FROM expenses")
cursor.execute("DELETE FROM subscriptions")
cursor.execute("DELETE FROM budgets")
conn.commit()

# Categories for expenses
expense_categories = [
    "Food & Dining", 
    "Groceries",
    "Transportation",
    "Entertainment",
    "Shopping",
    "Utilities",
    "Travel",
    "Healthcare",
    "Education",
    "Housing",
    "Personal Care",
    "Gifts & Donations",
    "Fitness"
]

# Subscription service names by category
subscription_services = {
    "Streaming": ["Netflix", "HBO Max", "Disney+", "Hulu", "Amazon Prime Video", "Apple TV+", "Peacock Premium", "Paramount+"],
    "Music": ["Spotify Premium", "Apple Music", "YouTube Music", "Amazon Music", "Tidal HiFi"],
    "Gaming": ["Xbox Game Pass", "PlayStation Plus", "Nintendo Switch Online", "EA Play", "Google Play Pass"],
    "Software": ["Adobe Creative Cloud", "Microsoft 365", "Notion Pro", "Dropbox Plus", "Google One Storage"],
    "News": ["The New York Times", "Wall Street Journal", "Washington Post", "The Economist", "The New Yorker"],
    "Food Delivery": ["DoorDash DashPass", "Uber Eats Pass", "Grubhub+", "Instacart Express"],
    "Fitness": ["Peloton Membership", "Fitbit Premium", "Nike Training Club", "Apple Fitness+", "Headspace"],
    "Other": ["Amazon Prime", "iCloud Storage", "LinkedIn Premium", "Audible", "YouTube Premium"]
}

# Food & Dining descriptions
food_descriptions = [
    "Lunch at Chipotle", "Dinner at Olive Garden", "Coffee at Starbucks", "Pizza delivery", 
    "Thai takeout", "Breakfast at IHOP", "Burger King drive-thru", "Subway sandwich", 
    "Sushi with friends", "Mexican restaurant", "Ramen shop", "Steakhouse dinner",
    "Ice cream shop", "Bakery treats", "Food truck lunch", "Salad bar", "Smoothie shop"
]

# Groceries descriptions
grocery_descriptions = [
    "Weekly grocery run", "Trader Joe's", "Whole Foods", "Costco bulk shopping", 
    "Fresh produce", "Quick grocery stop", "Walmart groceries", "Target essentials",
    "Kroger shopping", "Specialty food store", "International market", "Farmers market"
]

# Transportation descriptions
transportation_descriptions = [
    "Uber ride", "Lyft to work", "Gas station fill-up", "Car maintenance", 
    "Parking fee", "Public transit pass", "Taxi fare", "Airport shuttle",
    "Bridge toll", "Train ticket", "Bus fare", "Electric car charging"
]

# Entertainment descriptions
entertainment_descriptions = [
    "Movie tickets", "Concert tickets", "Live show", "Theater performance", 
    "Museum entry", "Bowling night", "Arcade games", "Streaming rental",
    "Amusement park", "Sporting event", "Book purchase", "Board game"
]

# Shopping descriptions
shopping_descriptions = [
    "Amazon order", "Target shopping", "Clothing purchase", "Electronics", 
    "Home goods", "Walmart run", "Gift purchase", "Hardware store",
    "Furniture", "Office supplies", "Beauty products", "Sporting goods",
    "Book store", "Craft supplies", "Pet supplies"
]

# Utilities descriptions
utilities_descriptions = [
    "Electric bill", "Water bill", "Gas bill", "Internet service", 
    "Mobile phone bill", "Cable TV", "Trash service", "Sewer bill"
]

# Travel descriptions
travel_descriptions = [
    "Hotel stay", "Flight tickets", "Airbnb booking", "Car rental", 
    "Travel insurance", "Airport parking", "Luggage purchase", "Vacation packages",
    "Tour booking", "Cruise payment", "Travel gear", "Foreign currency exchange"
]

# Healthcare descriptions
healthcare_descriptions = [
    "Doctor visit copay", "Prescription medication", "Therapy session", "Dental cleaning", 
    "Eye exam", "Vitamins and supplements", "First aid supplies", "Medical equipment",
    "Gym membership", "Health insurance premium", "Urgent care visit", "Specialist appointment"
]

# Education descriptions
education_descriptions = [
    "Textbooks", "Tuition payment", "Online course", "School supplies", 
    "Professional certification", "Workshop fee", "Tutoring", "Professional books",
    "Educational software", "Language learning app", "Art class", "Coding bootcamp"
]

# Housing descriptions
housing_descriptions = [
    "Rent payment", "Mortgage payment", "Home repair", "Furniture purchase", 
    "Cleaning service", "Home decor", "Property taxes", "Moving expenses",
    "Home insurance", "HOA fees", "Lawn service", "Security system"
]

# Personal Care descriptions
personal_care_descriptions = [
    "Haircut", "Spa service", "Skincare products", "Makeup", 
    "Nail salon", "Gym membership", "Personal trainer", "Wellness appointment",
    "Massage therapy", "Salon products", "Grooming items", "Dental products"
]

# Gifts & Donations descriptions
gifts_donations_descriptions = [
    "Birthday gift", "Holiday present", "Wedding gift", "Charity donation", 
    "Fundraiser contribution", "Housewarming gift", "Baby shower gift", "Tipping",
    "Religious donation", "School fundraiser", "Support local business", "Community fund"
]

# Fitness descriptions
fitness_descriptions = [
    "Gym membership", "Fitness equipment", "Workout clothes", "Personal training", 
    "Yoga class", "Sports league fee", "Race registration", "Fitness app subscription",
    "Health supplements", "Sports gear", "Fitness tracker", "Athletic shoes"
]

# Map categories to descriptions
category_descriptions = {
    "Food & Dining": food_descriptions,
    "Groceries": grocery_descriptions,
    "Transportation": transportation_descriptions,
    "Entertainment": entertainment_descriptions,
    "Shopping": shopping_descriptions,
    "Utilities": utilities_descriptions,
    "Travel": travel_descriptions,
    "Healthcare": healthcare_descriptions,
    "Education": education_descriptions,
    "Housing": housing_descriptions,
    "Personal Care": personal_care_descriptions,
    "Gifts & Donations": gifts_donations_descriptions,
    "Fitness": fitness_descriptions
}

# Generate random expenses for the past year
print("Generating expense data...")
expenses_to_create = 350  # Number of expenses to create
end_date = datetime.datetime.now().date()
start_date = end_date - datetime.timedelta(days=365)

# Create expenses with a realistic distribution
dates = []
for _ in range(expenses_to_create):
    # Generate dates with more recent dates being more common
    days_ago = int(random.triangular(0, 365, 60))  # More density in recent 2 months
    expense_date = end_date - datetime.timedelta(days=days_ago)
    dates.append(expense_date)

# Sort dates from oldest to newest
dates.sort()

for i, expense_date in enumerate(dates):
    # Select a category with weighted probabilities
    category = random.choices(
        expense_categories,
        weights=[20, 25, 15, 10, 15, 5, 3, 5, 2, 5, 5, 3, 5],  # Higher weight = more common
        k=1
    )[0]
    
    # Amount ranges by category
    if category == "Food & Dining":
        amount = round(random.uniform(8.0, 150.0), 2)
    elif category == "Groceries":
        amount = round(random.uniform(15.0, 250.0), 2)
    elif category == "Transportation":
        amount = round(random.uniform(5.0, 200.0), 2)
    elif category == "Entertainment":
        amount = round(random.uniform(10.0, 120.0), 2)
    elif category == "Shopping":
        amount = round(random.uniform(10.0, 300.0), 2)
    elif category == "Utilities":
        amount = round(random.uniform(30.0, 250.0), 2)
    elif category == "Travel":
        amount = round(random.uniform(100.0, 1500.0), 2)
    elif category == "Healthcare":
        amount = round(random.uniform(15.0, 500.0), 2)
    elif category == "Education":
        amount = round(random.uniform(20.0, 1000.0), 2)
    elif category == "Housing":
        amount = round(random.uniform(50.0, 2000.0), 2)
    elif category == "Personal Care":
        amount = round(random.uniform(10.0, 200.0), 2)
    elif category == "Gifts & Donations":
        amount = round(random.uniform(10.0, 300.0), 2)
    elif category == "Fitness":
        amount = round(random.uniform(10.0, 200.0), 2)
    else:
        amount = round(random.uniform(10.0, 100.0), 2)
    
    # Get a random description for the category
    description = random.choice(category_descriptions[category])
    
    # Insert the expense
    cursor.execute(
        'INSERT INTO expenses (amount, category, description, date) VALUES (?, ?, ?, ?)',
        (amount, category, description, expense_date.strftime('%Y-%m-%d'))
    )

conn.commit()
print(f"Created {expenses_to_create} expenses")

# Generate subscriptions
print("Generating subscription data...")
subscriptions_to_create = 15  # Number of subscriptions to create

# Current date and one month ago (to stagger renewal dates)
today = datetime.datetime.now().date()
one_month_ago = today - datetime.timedelta(days=30)

# Create subscriptions
for i in range(subscriptions_to_create):
    # Select a category
    category = random.choice(list(subscription_services.keys()))
    
    # Select a service from that category
    name = random.choice(subscription_services[category])
    
    # Define amount based on service type
    if "Netflix" in name or "HBO" in name or "Disney+" in name:
        amount = round(random.uniform(8.99, 19.99), 2)
    elif "Music" in category:
        amount = round(random.uniform(4.99, 14.99), 2)
    elif "Gaming" in category:
        amount = round(random.uniform(4.99, 15.99), 2)
    elif "Adobe" in name:
        amount = round(random.uniform(20.99, 52.99), 2)
    elif "Microsoft" in name:
        amount = round(random.uniform(6.99, 10.99), 2)
    elif "Storage" in name:
        amount = round(random.uniform(1.99, 9.99), 2)
    elif "News" in category:
        amount = round(random.uniform(3.99, 39.99), 2)
    elif "Food" in category:
        amount = round(random.uniform(9.99, 12.99), 2)
    elif "Fitness" in category:
        amount = round(random.uniform(7.99, 29.99), 2)
    elif "Amazon Prime" in name:
        amount = 14.99 if random.random() > 0.5 else 139.0/12  # Monthly vs. annual
    else:
        amount = round(random.uniform(4.99, 29.99), 2)
    
    # Billing cycle with realistic weights
    billing_cycle = random.choices(
        ["monthly", "quarterly", "semi-annual", "annual", "yearly"],
        weights=[70, 5, 5, 15, 5],  # Monthly is most common
        k=1
    )[0]
    
    # Randomize start dates to be 1-300 days in the past
    days_in_past = random.randint(1, 300)
    start_date = today - datetime.timedelta(days=days_in_past)
    
    # Calculate renewal date based on billing cycle
    if billing_cycle == "monthly":
        renewal_date = today + relativedelta(months=1)
    elif billing_cycle == "quarterly":
        renewal_date = today + relativedelta(months=3)
    elif billing_cycle == "semi-annual":
        renewal_date = today + relativedelta(months=6)
    else:  # annual or yearly
        renewal_date = today + relativedelta(years=1)
    
    # Add some randomness to renewal dates to make them more realistic
    renewal_date = renewal_date + datetime.timedelta(days=random.randint(-5, 5))
    
    # Insert the subscription
    cursor.execute(
        '''INSERT INTO subscriptions 
           (name, amount, category, billing_cycle, start_date, renewal_date) 
           VALUES (?, ?, ?, ?, ?, ?)''',
        (
            name,
            amount,
            category,
            billing_cycle,
            start_date.strftime('%Y-%m-%d'),
            renewal_date.strftime('%Y-%m-%d')
        )
    )

conn.commit()
print(f"Created {subscriptions_to_create} subscriptions")

# Generate budget data
print("Generating budget data...")
budgets_to_create = min(9, len(expense_categories))  # Create budgets for most categories

# Get current date for budget start
current_date = datetime.datetime.now().date()
current_month_start = datetime.date(current_date.year, current_date.month, 1)
prev_month_start = current_month_start - relativedelta(months=1)

# Select random categories for budgets
budget_categories = random.sample(expense_categories, budgets_to_create)

# Budget amounts by category (realistic monthly amounts)
budget_amounts = {
    "Food & Dining": round(random.uniform(300, 600), 2),
    "Groceries": round(random.uniform(400, 800), 2),
    "Transportation": round(random.uniform(150, 400), 2),
    "Entertainment": round(random.uniform(100, 300), 2),
    "Shopping": round(random.uniform(200, 500), 2),
    "Utilities": round(random.uniform(200, 500), 2),
    "Travel": round(random.uniform(200, 1000), 2),
    "Healthcare": round(random.uniform(100, 500), 2),
    "Education": round(random.uniform(100, 500), 2),
    "Housing": round(random.uniform(1000, 2500), 2),
    "Personal Care": round(random.uniform(50, 200), 2),
    "Gifts & Donations": round(random.uniform(50, 200), 2),
    "Fitness": round(random.uniform(50, 200), 2)
}

# Current timestamp for created_at and updated_at
current_timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

# Create budgets
for category in budget_categories:
    # Choose period with weighted probabilities
    period = random.choices(
        ["monthly", "quarterly", "annual"],
        weights=[80, 15, 5],  # Monthly is most common
        k=1
    )[0]
    
    # Set amount based on category and period
    if period == "monthly":
        amount = budget_amounts.get(category, 300)
    elif period == "quarterly":
        amount = budget_amounts.get(category, 300) * 3
    else:  # annual
        amount = budget_amounts.get(category, 300) * 12
    
    # Use either current month or previous month as start date
    start_date = current_month_start if random.random() > 0.3 else prev_month_start
    
    # Insert the budget
    cursor.execute(
        '''INSERT INTO budgets 
           (category, amount, period, start_date, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?)''',
        (
            category,
            amount,
            period,
            start_date.strftime('%Y-%m-%d'),
            current_timestamp,
            current_timestamp
        )
    )

conn.commit()
print(f"Created {budgets_to_create} budgets")

# Close connection
conn.close()
print("Data seeding complete!")