import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
from funcs.utils.recommender_logging import log_message
from dotenv import load_dotenv
from sqlalchemy.orm import declarative_base
from funcs.utils.recommender_logging import logger

# Load environment variables from .env
load_dotenv()

Base = declarative_base()

class DatabaseConnectionManager:
    """Manages PostgreSQL connections and sessions using SQLAlchemy."""

    def __init__(
        self, 
        app_name, 
        database_name=None, 
        pool_size=5, 
        max_overflow=20
    ):
        self.pgConfig = {
            'user': os.environ.get('PG_USER'),
            'password': os.environ.get('PG_PASSWORD'),
            'host': os.environ.get('PG_SERVER'),
            'port': os.environ.get('PG_PORT', 5432)  # Default PostgreSQL port
        }

        self.app_name = app_name
        self.pool_size = pool_size
        self.max_overflow = max_overflow
        self.database_name = database_name or os.environ.get("PG_DATABASE")
        self._setup_engine()

    def _setup_engine(self):
        """Setup the database engine with connection pooling."""
        database_url = (
            f"postgresql://{self.pgConfig['user']}:{self.pgConfig['password']}@"
            f"{self.pgConfig['host']}:{self.pgConfig['port']}/{self.database_name}"
            f"?application_name={self.app_name}"
        )

        self.engine = create_engine(
            database_url,
            pool_size=self.pool_size,
            max_overflow=self.max_overflow,
            pool_recycle=1000,
            pool_timeout=30
        )
        self.SessionLocal = sessionmaker(bind=self.engine)

    def get_session(self):
        """Provides a session for database transactions."""
        return self.SessionLocal()

    def test_connection(self):
        """Test the database connection."""
        try:
            with self.engine.connect() as connection:
                logger.info(" Connection to PostgreSQL established successfully!")
        except OperationalError as e:
            logger.error(f" Error: Unable to connect to the database.\n{e}")

if __name__ == "__main__":
    # Initialize the DatabaseConnectionManager
    db_manager = DatabaseConnectionManager(app_name="db/orm_db_manager.py")

    # Test the database connection
    db_manager.test_connection()
