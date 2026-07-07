"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  User as UserIcon,
  ShoppingBag,
  MapPin,
  Heart,
  LifeBuoy,
  LogOut,
  Loader2,
  Trash2,
  Plus,
  Compass,
  CheckCircle,
  Clock,
  Truck,
  Package,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);

  // Form states
  const [profileName, setProfileName] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
    isDefault: false,
  });
  const [addingAddress, setAddingAddress] = useState(false);

  // Support Ticket Form
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "General Query",
    message: "",
  });
  const [creatingTicket, setCreatingTicket] = useState(false);

  // Active Ticket Reply Chat State
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Active Order Detail Modal State
  const [activeOrder, setActiveOrder] = useState(null);

  // Fetch Dashboard user content
  const loadDashboardData = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setProfileName(data.user.name);
        setAddresses(data.savedAddresses || []);
        setOrders(data.orders || []);
      }

      const tRes = await fetch("/api/tickets");
      if (tRes.ok) {
        const tData = await tRes.json();
        setTickets(tData || []);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadDashboardData();
    } else if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status]);

  if (loading || status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF6EE]">
        <Loader2 className="animate-spin text-camel" size={32} />
      </div>
    );
  }

  // Edit Profile Action
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (profileName.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    setUpdatingProfile(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_profile", name: profileName }),
      });
      if (res.ok) {
        toast.success("Profile details updated successfully");
        loadDashboardData();
      } else {
        toast.error("Failed to update profile details");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Add Address Action
  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.postalCode || !addressForm.phone) {
      toast.error("Please fill in all address fields");
      return;
    }
    setAddingAddress(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_address", address: addressForm }),
      });
      if (res.ok) {
        toast.success("New address added successfully");
        setShowAddressForm(false);
        setAddressForm({ street: "", city: "", state: "", postalCode: "", phone: "", isDefault: false });
        loadDashboardData();
      } else {
        toast.error("Failed to save address");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setAddingAddress(false);
    }
  };

  // Delete Address Action
  const handleDeleteAddress = async (addressId) => {
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_address", addressId }),
      });
      if (res.ok) {
        toast.success("Address removed successfully");
        loadDashboardData();
      } else {
        toast.error("Failed to remove address");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  // Set Default Address Action
  const handleSetDefaultAddress = async (addressId) => {
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_default_address", addressId }),
      });
      if (res.ok) {
        toast.success("Default address updated");
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Support Ticket creation
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.message) {
      toast.error("Please enter a subject and details description");
      return;
    }
    setCreatingTicket(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketForm),
      });
      if (res.ok) {
        toast.success("Support ticket opened successfully. We will respond shortly.");
        setShowTicketForm(false);
        setTicketForm({ subject: "", category: "General Query", message: "" });
        loadDashboardData();
      } else {
        toast.error("Failed to create ticket");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setCreatingTicket(false);
    }
  };

  // Support Ticket message reply submit
  const handleSendTicketReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSendingReply(true);
    try {
      const res = await fetch(`/api/tickets/${activeTicket._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: replyText }),
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveTicket(updated);
        setReplyText("");
        loadDashboardData();
      } else {
        toast.error("Failed to send message");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSendingReply(false);
    }
  };

  // Order timeline icons helper
  const getOrderTimelineIcon = (statusName) => {
    switch (statusName) {
      case "Pending": return <Clock size={16} />;
      case "Confirmed": return <CheckCircle size={16} />;
      case "Packed": return <Package size={16} />;
      case "Shipped": return <Truck size={16} />;
      case "Delivered": return <CheckCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <div className="bg-[#FCFAF7] min-h-screen text-primary overflow-x-hidden font-sans pt-24 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner Title */}
        <div className="border-b border-[#EAE2DC] pb-6 mb-8 flex justify-between items-center flex-wrap gap-4">
          <div className="text-left space-y-1">
            <span className="text-[10px] tracking-[0.25em] font-semibold text-camel uppercase">Account Portal</span>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-wide">
              Hello, {profile?.name}
            </h1>
          </div>
          <Button
            onClick={() => signOut({ callbackUrl: "/" })}
            variant="outline"
            className="border-[#EAE2DC] hover:bg-[#F8F3F0] text-xs uppercase font-bold tracking-wider"
          >
            <LogOut size={14} className="mr-2" /> Sign Out
          </Button>
        </div>

        {/* Dashboard Split columns */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT Sidebar navigation */}
          <div className="lg:col-span-1 bg-white border border-[#EAE2DC] p-5 rounded-2xl h-fit space-y-2">
            {[
              { id: "profile", label: "My Profile", icon: <UserIcon size={16} /> },
              { id: "orders", label: "Order History", icon: <ShoppingBag size={16} /> },
              { id: "addresses", label: "Address Book", icon: <MapPin size={16} /> },
              { id: "wishlist", label: "My Wishlist", icon: <Heart size={16} /> },
              { id: "support", label: "Support Tickets", icon: <LifeBuoy size={16} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setActiveTicket(null);
                }}
                className={cn(
                  "w-full text-left text-xs uppercase tracking-wider font-bold py-3.5 px-4 rounded-xl flex items-center gap-3 transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-primary hover:bg-[#F8F3F0]"
                )}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* RIGHT Details Display Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* TAB: PROFILE DETAILS */}
            {activeTab === "profile" && (
              <div className="bg-white border border-[#EAE2DC] p-6 sm:p-8 rounded-2xl shadow-sm space-y-8 text-left">
                <div className="border-b border-[#EAE2DC] pb-4">
                  <h2 className="font-heading text-xl font-bold">Profile Details</h2>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="profileName" className="text-[10px] uppercase text-muted-foreground font-bold">Full Name</Label>
                    <Input
                      id="profileName"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      disabled={updatingProfile}
                      className="border-[#EAE2DC] text-xs h-10 focus:ring-camel focus:border-camel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase text-muted-foreground font-bold">Email Address</Label>
                    <Input
                      value={profile?.email}
                      disabled
                      className="border-[#EAE2DC] text-xs h-10 bg-slate-50 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase text-muted-foreground font-bold">Account Tier</Label>
                    <Input
                      value={profile?.role === "admin" ? "Store Administrator" : "Luxury Customer Member"}
                      disabled
                      className="border-[#EAE2DC] text-xs h-10 bg-slate-50 cursor-not-allowed capitalize font-semibold text-camel"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={updatingProfile}
                    className="bg-primary hover:bg-coffee text-white text-xs uppercase font-bold px-6 py-2 rounded-full w-fit"
                  >
                    {updatingProfile ? "Saving..." : "Save Profile Details"}
                  </Button>
                </form>
              </div>
            )}

            {/* TAB: ORDER HISTORY */}
            {activeTab === "orders" && (
              <div className="bg-white border border-[#EAE2DC] p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 text-left">
                <div className="border-b border-[#EAE2DC] pb-4">
                  <h2 className="font-heading text-xl font-bold">Order History</h2>
                </div>

                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord._id}
                        onClick={() => setActiveOrder(ord)}
                        className="border border-[#EAE2DC] hover:border-camel p-5 rounded-xl cursor-pointer shadow-sm transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs"
                      >
                        <div className="space-y-1.5">
                          <span className="font-bold text-primary text-sm">{ord.orderId}</span>
                          <p className="text-muted-foreground">Placed on: {new Date(ord.createdAt).toLocaleDateString()}</p>
                          <p className="text-muted-foreground font-semibold">Items: {ord.items.length}</p>
                        </div>

                        <div className="flex sm:flex-col items-start sm:items-end gap-3 sm:gap-1.5 w-full sm:w-auto justify-between sm:justify-center">
                          <span className="text-sm font-bold text-primary">Rs. {ord.summary.total}</span>
                          <span
                            className={cn(
                              "text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full",
                              ord.status === "Delivered" && "bg-green-100 text-green-700",
                              ord.status === "Pending" && "bg-yellow-100 text-yellow-700",
                              ord.status === "Confirmed" && "bg-blue-100 text-blue-700",
                              ord.status === "Cancelled" && "bg-red-100 text-red-700"
                            )}
                          >
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-10">No orders placed yet. Head over to our catalog to start curating.</p>
                )}
              </div>
            )}

            {/* TAB: ADDRESS BOOK */}
            {activeTab === "addresses" && (
              <div className="bg-white border border-[#EAE2DC] p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 text-left">
                <div className="border-b border-[#EAE2DC] pb-4 flex justify-between items-center">
                  <h2 className="font-heading text-xl font-bold">Address Book</h2>
                  {!showAddressForm && (
                    <Button
                      onClick={() => setShowAddressForm(true)}
                      size="sm"
                      className="bg-primary text-white text-[10px] uppercase font-bold tracking-wider"
                    >
                      <Plus size={12} className="mr-1" /> Add Address
                    </Button>
                  )}
                </div>

                {/* Inline Address Creation Form */}
                {showAddressForm && (
                  <form onSubmit={handleAddAddress} className="border border-[#EAE2DC] p-5 rounded-2xl space-y-4 max-w-lg bg-[#FAF6EE]/30">
                    <h3 className="text-xs uppercase tracking-wider font-bold">New Shipping Address</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="street" className="text-[10px] uppercase text-muted-foreground font-bold">Street Address</Label>
                      <Input
                        id="street"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        placeholder="Flat/House No., Street Name"
                        className="border-[#EAE2DC] text-xs h-10 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-[10px] uppercase text-muted-foreground font-bold">City</Label>
                        <Input
                          id="city"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          placeholder="New Delhi"
                          className="border-[#EAE2DC] text-xs h-10 bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-[10px] uppercase text-muted-foreground font-bold">State</Label>
                        <Input
                          id="state"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          placeholder="Delhi"
                          className="border-[#EAE2DC] text-xs h-10 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode" className="text-[10px] uppercase text-muted-foreground font-bold">Postal Code</Label>
                        <Input
                          id="postalCode"
                          value={addressForm.postalCode}
                          onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                          placeholder="110001"
                          className="border-[#EAE2DC] text-xs h-10 bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-[10px] uppercase text-muted-foreground font-bold">Contact Phone</Label>
                        <Input
                          id="phone"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          placeholder="9876543210"
                          className="border-[#EAE2DC] text-xs h-10 bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isDefault"
                        checked={addressForm.isDefault}
                        onCheckedChange={(checked) => setAddressForm({ ...addressForm, isDefault: !!checked })}
                      />
                      <label htmlFor="isDefault" className="text-xs font-semibold cursor-pointer">
                        Set as default address
                      </label>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        type="submit"
                        disabled={addingAddress}
                        className="bg-primary text-white text-xs uppercase"
                      >
                        {addingAddress ? "Saving..." : "Add Address"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddressForm(false)}
                        className="border-[#EAE2DC] text-xs uppercase"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                {/* Address Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={cn(
                        "border p-5 rounded-xl text-xs space-y-3 relative flex flex-col justify-between text-left",
                        addr.isDefault ? "border-camel bg-[#FAF6EE]/50 ring-1 ring-camel" : "border-[#EAE2DC]"
                      )}
                    >
                      <div className="space-y-1.5">
                        <span className="font-bold text-primary block">{profile?.name}</span>
                        <p className="text-muted-foreground leading-relaxed">
                          {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}
                        </p>
                        <span className="text-muted-foreground block">Phone: {addr.phone}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#EAE2DC]">
                        {!addr.isDefault ? (
                          <button
                            onClick={() => handleSetDefaultAddress(addr._id)}
                            className="text-[10px] text-camel hover:underline uppercase font-bold"
                          >
                            Set default
                          </button>
                        ) : (
                          <span className="bg-[#EAE2DC] text-primary text-[8px] font-bold tracking-wider px-2 py-0.5 rounded uppercase">
                            Default Address
                          </span>
                        )}

                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="text-red-500 hover:text-red-700 p-1 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: MY WISHLIST */}
            {activeTab === "wishlist" && (
              <div className="bg-white border border-[#EAE2DC] p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 text-left">
                <div className="border-b border-[#EAE2DC] pb-4">
                  <h2 className="font-heading text-xl font-bold">My Wishlist</h2>
                </div>

                {profile?.wishlist && profile.wishlist.filter(Boolean).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {profile.wishlist.filter(Boolean).map((prod) => (
                      <div key={prod._id} className="relative group">
                        <div className="aspect-[3/4] overflow-hidden rounded-xl bg-[#FAF6EE] border border-[#EAE2DC]">
                          <img
                            src={prod.images?.[0]}
                            alt={prod.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                          />
                        </div>
                        <div className="pt-3 text-left">
                          <Link href={`/product/${prod.slug}`}>
                            <h4 className="text-xs font-bold truncate hover:text-camel">{prod.title}</h4>
                          </Link>
                          <span className="text-xs font-bold text-camel">Rs. {prod.discountPrice || prod.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-10">Your wishlist is currently empty. Keep track of items you love.</p>
                )}
              </div>
            )}

            {/* TAB: SUPPORT TICKETS */}
            {activeTab === "support" && (
              <div className="bg-white border border-[#EAE2DC] p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 text-left">
                <div className="border-b border-[#EAE2DC] pb-4 flex justify-between items-center">
                  <h2 className="font-heading text-xl font-bold">Support Board</h2>
                  {!showTicketForm && !activeTicket && (
                    <Button
                      onClick={() => setShowTicketForm(true)}
                      size="sm"
                      className="bg-primary text-white text-[10px] uppercase font-bold tracking-wider"
                    >
                      <Plus size={12} className="mr-1" /> New Ticket
                    </Button>
                  )}
                </div>

                {/* Show active ticket chat detail */}
                {activeTicket ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => setActiveTicket(null)}
                      className="text-xs text-camel hover:underline flex items-center gap-1 uppercase font-bold tracking-wider mb-2"
                    >
                      ← Back to tickets
                    </button>
                    
                    <div className="border border-[#EAE2DC] p-5 rounded-2xl bg-[#FAF6EE]/20 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-camel">{activeTicket.category}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-200 uppercase">{activeTicket.status}</span>
                      </div>
                      <h3 className="font-heading text-lg font-bold">{activeTicket.subject}</h3>
                      <p className="text-xs text-muted-foreground">{activeTicket.message}</p>
                    </div>

                    {/* Chat messages */}
                    <div className="space-y-4 max-h-[300px] overflow-y-auto p-4 border border-[#EAE2DC] rounded-xl bg-slate-50">
                      {activeTicket.messages.length > 0 ? (
                        activeTicket.messages.map((msg, i) => (
                          <div
                            key={i}
                            className={cn(
                              "max-w-[80%] p-3.5 rounded-xl text-xs space-y-1.5",
                              msg.sender === "customer"
                                ? "bg-primary text-white ml-auto text-right"
                                : "bg-white border border-[#EAE2DC] mr-auto text-left"
                            )}
                          >
                            <span className="text-[8px] uppercase tracking-widest block opacity-75 font-semibold">
                              {msg.sender === "customer" ? "You" : "Aura Support"}
                            </span>
                            <p className="leading-relaxed">{msg.text}</p>
                            <span className="text-[8px] block opacity-50">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-muted-foreground text-center">No replies yet. Aura Support is reviewing your request.</p>
                      )}
                    </div>

                    {/* Reply form */}
                    {activeTicket.status !== "Resolved" && (
                      <form onSubmit={handleSendTicketReply} className="flex gap-2">
                        <Input
                          placeholder="Type your reply here..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          disabled={sendingReply}
                          className="border-[#EAE2DC] text-xs h-10 flex-1 bg-white"
                        />
                        <Button type="submit" disabled={sendingReply} className="bg-primary text-white text-xs uppercase">
                          {sendingReply ? "Sending..." : "Send"}
                        </Button>
                      </form>
                    )}
                  </div>
                ) : showTicketForm ? (
                  /* Create Ticket Form */
                  <form onSubmit={handleCreateTicket} className="border border-[#EAE2DC] p-5 rounded-2xl space-y-4 max-w-lg bg-[#FAF6EE]/30">
                    <h3 className="text-xs uppercase tracking-wider font-bold">Open New Support Ticket</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-[10px] uppercase text-muted-foreground font-bold">Category</Label>
                      <select
                        id="category"
                        value={ticketForm.category}
                        onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                        className="w-full border border-[#EAE2DC] rounded-md p-2.5 text-xs bg-white"
                      >
                        <option value="General Query">General Query</option>
                        <option value="Order Status">Order Status & Tracking</option>
                        <option value="Return Request">Returns & Refunds</option>
                        <option value="Product Feedback">Product Questions</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-[10px] uppercase text-muted-foreground font-bold">Subject</Label>
                      <Input
                        id="subject"
                        value={ticketForm.subject}
                        onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                        placeholder="e.g. Return request for Trench Coat"
                        className="border-[#EAE2DC] text-xs h-10 bg-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="t-msg" className="text-[10px] uppercase text-muted-foreground font-bold">Message Details</Label>
                      <Textarea
                        id="t-msg"
                        value={ticketForm.message}
                        onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                        placeholder="Please describe your query in detail..."
                        rows={4}
                        className="border-[#EAE2DC] text-xs bg-white"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        type="submit"
                        disabled={creatingTicket}
                        className="bg-primary text-white text-xs uppercase"
                      >
                        {creatingTicket ? "Submitting..." : "Submit Ticket"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowTicketForm(false)}
                        className="border-[#EAE2DC] text-xs uppercase"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* Tickets List */
                  <div className="space-y-4">
                    {tickets.length > 0 ? (
                      tickets.map((t) => (
                        <div
                          key={t._id}
                          onClick={() => setActiveTicket(t)}
                          className="border border-[#EAE2DC] hover:border-camel p-5 rounded-xl cursor-pointer transition-all flex justify-between items-center text-xs shadow-sm bg-white"
                        >
                          <div className="space-y-1.5">
                            <span className="font-bold text-primary block text-sm">{t.subject}</span>
                            <span className="text-[10px] text-camel uppercase tracking-widest font-semibold">{t.category}</span>
                            <p className="text-muted-foreground text-[10px]">Opened: {new Date(t.createdAt).toLocaleDateString()}</p>
                          </div>
                          
                          <span
                            className={cn(
                              "text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full",
                              t.status === "Open" && "bg-yellow-100 text-yellow-700",
                              t.status === "In Progress" && "bg-blue-100 text-blue-700",
                              t.status === "Resolved" && "bg-green-100 text-green-700"
                            )}
                          >
                            {t.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-10">No support tickets raised yet.</p>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Detailed Order Timeline tracker Popup */}
      {activeOrder && (
        <Dialog open={!!activeOrder} onOpenChange={() => setActiveOrder(null)}>
          <DialogContent className="bg-white max-w-2xl border-[#EAE2DC] rounded-2xl font-sans text-primary">
            <DialogHeader className="text-left border-b border-[#EAE2DC] pb-4">
              <DialogTitle className="font-heading text-xl font-bold flex justify-between items-baseline flex-wrap gap-2">
                <span>Order details: {activeOrder.orderId}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Date: {new Date(activeOrder.createdAt).toLocaleDateString()}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4 overflow-y-auto max-h-[75vh]">
              {/* Order Status Timeline Visualization */}
              <div className="bg-[#FAF6EE] border border-[#EAE2DC] p-5 rounded-xl text-left space-y-4">
                <span className="text-[9px] uppercase tracking-widest font-bold text-camel">Order Progress</span>
                <div className="flex justify-between items-center gap-2 overflow-x-auto py-2">
                  {["Pending", "Confirmed", "Packed", "Shipped", "Delivered"].map((st, i, arr) => {
                    const statusIndex = arr.indexOf(activeOrder.status);
                    const isCompleted = arr.indexOf(st) <= statusIndex;

                    return (
                      <div key={st} className="flex flex-col items-center flex-1 min-w-[70px] relative">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border z-10 transition-colors",
                            isCompleted ? "bg-primary border-primary text-white" : "border-[#EAE2DC] bg-white text-muted-foreground"
                          )}
                        >
                          {getOrderTimelineIcon(st)}
                        </div>
                        <span className={cn("text-[9px] uppercase tracking-wider font-bold mt-2", isCompleted ? "text-primary" : "text-muted-foreground")}>
                          {st}
                        </span>
                        
                        {/* Connecting Line */}
                        {i < arr.length - 1 && (
                          <div
                            className={cn(
                              "absolute h-[2px] top-4 left-[60%] w-[80%] -z-0",
                              arr.indexOf(arr[i + 1]) <= statusIndex ? "bg-primary" : "bg-[#EAE2DC]"
                            )}
                          ></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-widest font-bold text-left">Purchased Items</h4>
                <div className="space-y-3">
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-xs text-left border-b border-[#EAE2DC] pb-3">
                      <img src={item.image} className="w-10 h-13 object-cover rounded-lg border border-[#EAE2DC] bg-[#FAF6EE]" />
                      <div className="flex-1">
                        <span className="font-bold block">{item.title}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          Qty: {item.quantity} / Size: {item.size} / Shade: {item.color}
                        </span>
                      </div>
                      <span className="font-bold">Rs. {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping address summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-left">
                <div className="bg-[#FAF6EE]/50 border border-[#EAE2DC] p-4 rounded-xl space-y-2">
                  <h4 className="font-bold uppercase tracking-wide text-camel">Shipping Address</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {activeOrder.shippingAddress.name} <br/>
                    {activeOrder.shippingAddress.street} <br/>
                    {activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state} - {activeOrder.shippingAddress.postalCode}
                  </p>
                  <span className="text-muted-foreground">Phone: {activeOrder.shippingAddress.phone}</span>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold uppercase tracking-wide text-camel">Charges Breakdowns</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>Rs. {activeOrder.summary.subtotal}</span>
                    </div>
                    {activeOrder.summary.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>- Rs. {activeOrder.summary.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxes</span>
                      <span>Rs. {activeOrder.summary.tax}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{activeOrder.summary.shipping === 0 ? "Free" : `Rs. ${activeOrder.summary.shipping}`}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-[#EAE2DC] pt-2 text-primary">
                      <span>Total</span>
                      <span>Rs. {activeOrder.summary.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </div>
  );
}
