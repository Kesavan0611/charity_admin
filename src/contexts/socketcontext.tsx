"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Notification {
	_id: string;
	title: string;
	raisedAmount: number;
	totalDonation: number;
	createdAt: string;
	status: string;
	userId?: {
		_id: string;
		name: string;
		email: string;
	};
	categoryId?: {
		name: string;
	};
	notificationStatus?: boolean;
}

interface SocketContextType {
	socket: Socket | null;
	isConnected: boolean;
	notifications: Notification[];
	unreadCount: number;
	setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
	setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

const SocketContext = createContext<SocketContextType>({
	socket: null,
	isConnected: false,
	notifications: [],
	unreadCount: 0,
	setNotifications: () => {},
	setUnreadCount: () => {},
});

export const useSocket = (): SocketContextType => {
	const context = useContext(SocketContext);
	if (!context) {
		throw new Error("useSocket must be used within a SocketProvider");
	}
	return context;
};

// Update the interface to match your User type
interface SocketProviderProps {
	children: React.ReactNode;
	user: {
		id: string;
		name?: string; // Make optional to match your User type
		email?: string; // Make optional to match your User type
	} | null;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children, user }) => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [isConnected, setIsConnected] = useState<boolean>(false);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState<number>(0);

	// In SocketProvider component
	useEffect(() => {
		if (!user?.id) return;

		const newSocket = io("http://localhost:3009", {
			withCredentials: true,
			transports: ["websocket", "polling"],
			query: { userId: user.id },
		});

		newSocket.on("connect", () => {
			console.log("✅ Connected to server with ID:", newSocket.id);
			setIsConnected(true);
			newSocket.emit("get-notifications");
		});

		newSocket.on("notifications-data", (data: Notification[]) => {
			console.log("📨 Received notifications:", data.length);
			setNotifications(data);
			setUnreadCount(data.filter((n) => n.notificationStatus && n.status === "pending").length);
		});

		newSocket.on("new-notification", (newNotification: Notification) => {
			console.log("📨 New notification received");
			setNotifications((prev) => [newNotification, ...prev]);
			setUnreadCount((prev) => prev + 1);
		});

		// NEW: Handle live notification updates
		newSocket.on("notification-updated", (updateData: { _id: string; status: string; notificationStatus: boolean }) => {
			console.log("🔄 Notification updated live:", updateData._id);

			setNotifications((prev) =>
				prev.map((notification) =>
					notification._id === updateData._id
						? {
								...notification,
								status: updateData.status,
								notificationStatus: updateData.notificationStatus,
							}
						: notification
				)
			);

			// Update unread count if notification was marked as read
			if (!updateData.notificationStatus) {
				setUnreadCount((prev) => Math.max(0, prev - 1));
			}
		});

		newSocket.on("connect_error", (error: Error) => {
			console.error("Connection error:", error);
		});

		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, [user?.id]);

	const value: SocketContextType = {
		socket,
		isConnected,
		notifications,
		unreadCount,
		setNotifications,
		setUnreadCount,
	};

	return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
