"""
Initialize database tables.

Run this script to create all tables defined in the ORM models:
    python -m app.db.init_tables
"""

import sys

from app.db.base import Base
from app.db.session import engine


def init_tables():
    """Create all tables in the database."""
    print("=" * 60)
    print("Initializing Database Tables")
    print("=" * 60)
    print(f"\nCreating tables for metadata: {Base.metadata}\n")

    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)

        # List created tables
        print("✓ Successfully created tables:")
        for table_name in Base.metadata.tables.keys():
            print(f"  - {table_name}")

        print("\n" + "=" * 60)
        print("Database initialization complete!")
        print("=" * 60)
        return True

    except Exception as e:
        print(f"\n✗ Error creating tables: {e}\n")
        print("=" * 60)
        return False


if __name__ == "__main__":
    success = init_tables()
    sys.exit(0 if success else 1)
