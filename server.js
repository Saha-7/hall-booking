// Import required modules
const express = require("express");
const cors = require("cors");
const app = express();
const { format } = require("date-fns");

// Middleware
app.use(cors());
app.use(express.json());

// Local data for rooms & bookings
const rooms = [
    {
        roomName: "Auditorium",
        roomId: "101",
        seats: 100,
        amenities: "wifi,projector,AC",
        price: 15000,
    },
    {
        roomName: "Banquet",
        roomId: "102",
        seats: 150,
        amenities: "speaker,projector,AC",
        price: 20000,
    },
    {
        roomName: "Conference ",
        roomId: "103",
        seats: 75,
        amenities: "wifi,projector,AC,tables",
        price: 12500,
    },
];

const bookings = [
    {
        bookingId: 1,
        customerName: "arun",
        roomId: "K1",
        date: format(new Date("09-12-2023"), "dd-MMM-yyyy"),
        start: "08:00",
        end: "09:00",
        status: "confirmed",
      },
      {
        bookingId: 2,
        customerName: "kumar",
        roomId: "R2",
        date: format(new Date("9-14-2023"), "dd-MMM-yyyy"),
        start: "08:00",
        end: "09:00",
        status: "waiting for confirmation",
      },
      {
        bookingId: 3,
        customerName: "surdari",
        roomId: "S1",
        date: format(new Date("09-12-2023"), "dd-MMM-yyyy"),
        start: "08:00",
        end: "09:00",
        status: "confirmed",
      },
];

// API Endpoint for App Home
app.get("/", (req, res) => {
  res.send("<h1>Hall Booking</h1>");
});

// API Endpoint for getting all details of Rooms
app.get("/rooms", (req, res) => {
  res.json(rooms);
});

// API Endpoint for adding details in Rooms
app.post("/rooms", (req, res) => {
  const { roomName, seats, amenities, price } = req.body;
  const room = {
    roomName,
    roomId: (rooms.length + 1).toString().padStart(2, '0'), // Adding zero-padding to roomId
    seats,
    amenities,
    price,
  };
  rooms.push(room);
  res.status(201).json({ message: "Room added successfully", room });
});

// API Endpoint for getting all details of bookings
app.get("/bookings", (req, res) => {
  res.json(bookings);
});

// API Endpoint for adding details in Bookings
app.post("/bookings", (req, res) => {
  const { customerName, date, start, end, roomId, status } = req.body;

  // Check if the room is already booked for the given date and time
  const isRoomBooked = bookings.some(
    (booking) =>
      booking.date === date &&
      booking.roomId === roomId &&
      ((start >= booking.start && start < booking.end) ||
        (end > booking.start && end <= booking.end) ||
        (start <= booking.start && end >= booking.end))
  );

  if (isRoomBooked) {
    return res.status(409).json({ message: "Room already booked for the selected time" });
  }

  // Check if the requested room exists
  const roomExists = rooms.some((room) => room.roomId === roomId);

  if (!roomExists) {
    return res.status(404).json({ message: "Requested room not found. Please check available rooms." });
  }

  const booking = {
    bookingId: bookings.length + 1,
    customerName,
    date,
    start,
    end,
    roomId,
    status,
  };
  bookings.push(booking);
  res.status(201).json({ message: "Booking successful", booking });
});

// API Endpoint for listing all rooms with booked Data
app.get("/bookedRooms", (req, res) => {
    try {
      const bookedRoomDetails = bookings
        .filter((book) => book.status === "confirmed")
        .map((book) => {
          const roomData = rooms.find((room) => room.roomId === book.roomId);
          return {
            "Room Name": roomData ? roomData.roomName : "Room Not Found",
            "Booked Status": book.status,
            "Customer Name": book.customerName,
            Date: book.date,
            "Start Time": book.start,
            "End Time": book.end,
          };
        });
  
      res.json(bookedRoomDetails);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  // API Endpoint for listing all customers with booked Data
  app.get("/customers", (req, res) => {
    try {
      const customerData = bookings.map((book) => {
        const roomData = rooms.find((room) => room.roomId === book.roomId);
        return {
          "Customer Name": book.customerName,
          "Room Name": roomData ? roomData.roomName : "Room Not Found",
          Date: book.date,
          "Start Time": book.start,
          "End Time": book.end,
        };
      });
      res.json(customerData);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  // API Endpoint for listing the number of times a customer booked Data
  app.get("/customers/:name", (req, res) => {
    try {
      const customerName = req.params.name;
      const customerBookings = bookings.filter((book) => book.customerName === customerName);
  
      if (customerBookings.length > 0) {
        const customerData = customerBookings.map((data) => {
          const room = rooms.find((room) => room.roomId === data.roomId);
          return {
            "Customer Name": data.customerName,
            "Room Name": room ? room.roomName : "Room Not Found",
            Date: data.date,
            "Start Time": data.start,
            "End Time": data.end,
            "Booking id": data.bookingId,
            "Booking date": data.date,
            "Booking Status": data.status,
          };
        });
        res.json(customerData);
      } else {
        res.status(404).json({
          message: "Customer details not found or the customer has not booked any rooms yet",
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  

// Server listener
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
